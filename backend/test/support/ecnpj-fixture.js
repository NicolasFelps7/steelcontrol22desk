import { mkdtemp, writeFile, mkdir, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";
const execute=promisify(execFile);
export async function criarPkiTeste() {
 const folder=await mkdtemp(path.join(tmpdir(),"steelcontrol-pki-test-"));
 const file=n=>path.join(folder,n);
 const run=async args=>execute("openssl",args,{cwd:folder,timeout:30000,maxBuffer:1024*1024});
 await mkdir(file("certs"));await writeFile(file("index.txt"),"");await writeFile(file("serial"),"1000\n");await writeFile(file("crlnumber"),"1000\n");
 await run(["req","-x509","-newkey","rsa:2048","-nodes","-keyout","root.key","-out","root.pem","-days","3","-sha256","-subj","/CN=TEST ONLY SteelControl CA","-addext","basicConstraints=critical,CA:TRUE","-addext","keyUsage=critical,keyCertSign,cRLSign","-addext","subjectKeyIdentifier=hash"]);
 const config=san=>`[ca]\ndefault_ca=local\n[local]\ndatabase=index.txt\nserial=serial\ncrlnumber=crlnumber\nnew_certs_dir=certs\ncertificate=root.pem\nprivate_key=root.key\ndefault_md=sha256\ndefault_days=2\ndefault_crl_days=1\npolicy=policy\nunique_subject=no\n[policy]\ncommonName=supplied\n[leaf]\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,nonRepudiation\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid:always\nsubjectAltName=${san}\ncertificatePolicies=2.16.76.1.2.1.999999\n`;
 await writeFile(file("ca.cnf"),config("otherName:2.16.76.1.3.3;OCTETSTRING:11222333000181"));
 // Standard e-CNPJ OCTET STRING as well as legacy Printable/UTF8 are covered.
 async function leaf(name,cnpj="11222333000181",format="UTF8",extra=[]) {
  const san=cnpj ? (format==="OCTET" ? `otherName:2.16.76.1.3.3;OCTETSTRING:${cnpj}` : `otherName:2.16.76.1.3.3;${format}:${cnpj}`) : "email:test@example.com";
  await writeFile(file(name+".cnf"),config(san));
  await run(["req","-new","-newkey","rsa:2048","-nodes","-keyout",name+".key","-out",name+".csr","-subj",`/CN=TEST ONLY ${name} 11222333000181`]);
  await run(["ca","-batch","-config",name+".cnf","-in",name+".csr","-out",name+".pem","-notext","-extensions","leaf",...extra]);
 }
 await leaf("valid",undefined,"OCTET");await leaf("wrong","99888777000166");await leaf("missing",null);await leaf("expired",undefined,"PRINTABLE",["-startdate","20200101000000Z","-enddate","20210101000000Z"]);await leaf("revoked");
 await run(["ca","-config","ca.cnf","-revoke","revoked.pem"]);
 await run(["ca","-config","ca.cnf","-gencrl","-out","crls.pem"]);
 await run(["ca","-config","ca.cnf","-gencrl","-crl_lastupdate","20200101000000Z","-crl_nextupdate","20200102000000Z","-out","expired-crls.pem"]);
 async function sign(documento,name="valid",extra=[]) {
  const id=String(Math.random()).slice(2);await writeFile(file(id+".txt"),documento);
  await run(["cms","-sign","-binary","-in",id+".txt","-signer",name+".pem","-inkey",name+".key","-outform","DER","-out",id+".p7s","-md","sha256",...extra]);
  return readFile(file(id+".p7s"));
 }
 return {folder,file,run,sign,rootsPath:file("root.pem"),crlsPath:file("crls.pem"),cleanup:()=>rm(folder,{recursive:true,force:true})};
}
