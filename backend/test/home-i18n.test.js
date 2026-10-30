import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const page = fs.readFileSync(new URL('../../frontend/home.html',import.meta.url),'utf8');
const sandbox={};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('../../frontend/assets/js/home-locales.js',import.meta.url),'utf8'),sandbox);
const copy=sandbox.STEEL_HOME_COPY;
const marked=[...page.matchAll(/data-home-(?:t|text)="(t\d+)"/g)].map(m=>m[1]);
const attributes=[...page.matchAll(/data-home-attr="([^"]*)"/g)].flatMap(m=>Object.values(JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'))));
for(const lang of ['pt','en','es','fr','de','it']) test(`home completa tem tradução em ${lang}, incluindo legendas e acessibilidade`,()=>{
 assert.ok(marked.length>150);
 for(const key of [...marked,...attributes]) assert.ok(typeof copy[lang][key]==='string'&&copy[lang][key].trim(),`${lang}:${key}`);
 assert.deepEqual(Object.keys(copy[lang]),Object.keys(copy.pt));
});
test('home não mantém chamada de demonstração nem link para GitHub',()=>{
 assert.doesNotMatch(page,/Solicitar demonstração|github\.com/i);
 assert.match(page,/href="\/app\/login"[^>]*><span data-home-t="[^"]+">Acessar a plataforma/);
});
test('texto visível da home está marcado ou é nome técnico invariável',()=>{
 const text=page.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|svg|head)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<span data-home-t="[^"]+">[\s\S]*?<\/span>/g,'').replace(/<[^>]+>/g,'\n');
 const invariant=new Set(['SteelControl','SteelControl Edge','HTTP','MQTT','Modbus','OPC UA','TCP/IP','USB/Serial','MFA','LIBERAR','PT','EN','ES','FR','DE','IT']);
 for(const value of text.split('\n').map(s=>s.trim()).filter(s=>/[A-Za-zÀ-ÿ]/.test(s))) assert.ok(invariant.has(value),value);
});
test('login usa fundo industrial local sem esfera ou telemetria decorativa',()=>{
 const login=fs.readFileSync(new URL('../../frontend/login.html',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../../frontend/assets/css/login-industry.css',import.meta.url),'utf8');
 assert.doesNotMatch(login,/auth-3d-scene|auth-orbit|auth-identity-core|auth-data-one/);
 assert.match(css,/login-industry\.webp/);
 assert.ok(fs.statSync(new URL('../../frontend/assets/img/login-industry.webp',import.meta.url)).size<300000);
});
