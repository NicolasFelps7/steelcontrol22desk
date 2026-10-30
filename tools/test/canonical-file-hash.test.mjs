import test from "node:test";
import assert from "node:assert/strict";
import { canonicalFileHash } from "../canonical-file-hash.mjs";

for (const file of ["steel-hardhat.svg", "steel-icon-white.svg", "steel-icon.svg", "steel-mascot-body.svg", ".env.example", ".env", "config.js"]) {
  test(`${file}: CRLF e LF mantêm o mesmo hash`, () => {
    const lf = Buffer.from("linha 1: ação\nlinha 2\n");
    const crlf = Buffer.from(lf.toString().replaceAll("\n", "\r\n"));
    assert.equal(canonicalFileHash(file, lf), canonicalFileHash(file, crlf));
  });
}
test("alteração real de conteúdo continua sendo detectada", () => {
  assert.notEqual(canonicalFileHash("icon.svg", Buffer.from("<svg/>\n")), canonicalFileHash("icon.svg", Buffer.from("<svg><!-- change --></svg>\n")));
  assert.notEqual(canonicalFileHash(".env.example", Buffer.from("MODE=OFF\n")), canonicalFileHash(".env.example", Buffer.from("MODE=ON\n")));
});
test("arquivos binários conservam todos os bytes, inclusive CRLF", () => {
  assert.notEqual(canonicalFileHash("icon.png", Buffer.from([0,13,10,255])), canonicalFileHash("icon.png", Buffer.from([0,10,255])));
});
