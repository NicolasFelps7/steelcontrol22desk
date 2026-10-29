'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {developmentPython}=require('../python-runtime.cjs');
test('npm start usa o Python preparado pelo instalador Edge',()=>{
  const expected=path.join('/project','.venv-edge','Scripts','python.exe');
  assert.equal(developmentPython('/project',{platform:'win32',env:{},exists:file=>file===expected}),expected);
});
test('Python explícito prevalece e fallback funciona sem ambiente local',()=>{
  assert.equal(developmentPython('/project',{env:{STEELCONTROL_PYTHON:'/custom/python'}}),'/custom/python');
  assert.equal(developmentPython('/project',{platform:'win32',env:{},exists:()=>false}),'python');
  assert.equal(developmentPython('/project',{platform:'linux',env:{},exists:()=>false}),'python3');
});
