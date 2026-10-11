const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const source=fs.readFileSync('src/lib/careers/validation.ts','utf8');
const mod={exports:{}};new Function('exports','require','module',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(mod.exports,require,mod);
const {validateCareer}=mod.exports;
const careers=JSON.parse(fs.readFileSync('content/careers/careers.json','utf8'));
const resources=JSON.parse(fs.readFileSync('content/careers/resources.json','utf8'));
assert.equal(careers.length,6);assert.equal(resources.length,90);
for(const career of careers){const full={...career,resources:resources.filter(r=>career.stages.some(s=>s.resourceIds.includes(r.id))||career.projects.some(p=>p.starterResourceId===r.id))};validateCareer(structuredClone(full));assert.equal(full.projects.length,4);assert.ok(full.resources.length>=15&&full.resources.length<=25);assert.ok(full.stages.length>=7);const bad=structuredClone(full);bad.resources[0].url='javascript:alert(1)';assert.throws(()=>validateCareer(bad),/HTTPS/);const dup=structuredClone(full);dup.stages[1].id=dup.stages[0].id;assert.throws(()=>validateCareer(dup),/Duplicate/);const unknown=structuredClone(full);unknown.stages[0].resourceIds=['missing'];assert.throws(()=>validateCareer(unknown),/Unknown/);}
console.log('PASS six complete career seeds, project/resource counts and rejected unsafe URLs, duplicate IDs, unknown resources');
