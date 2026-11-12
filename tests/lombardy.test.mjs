import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const data=JSON.parse(read('../data/lombardy-provinces-2025.json'));
const built=read('../app/data/lombardy-2025.js');
const html=read('../app/index.html');
const script=read('../app/lombardy.js');
test('Lombardy comparison covers all twelve recognized provinces',()=>{
 const codes=['BG','BS','CO','CR','LC','LO','MN','MI','MB','PV','SO','VA'];
 assert.deepEqual(data.provinces.map(p=>p.code).sort(),codes.sort());
 assert.equal(new Set(data.provinces.map(p=>p.name)).size,12);
 assert.equal(data.year,2025);
});
test('Ten indicator definitions are unique, complete and numerically bounded',()=>{
 assert.equal(data.indicators.length,10);
 assert.equal(new Set(data.indicators.map(x=>x.id)).size,10);
 for(const entry of data.indicators){
  assert.ok(entry.label && entry.group && entry.unit);
  for(const values of [...data.provinces.map(p=>p.values),data.benchmark.values]){
   const v=values[entry.id];
   assert.ok(Number.isFinite(v),entry.id+' missing or not numeric');
   assert.ok(v>=0,entry.id+' negative');
   if(entry.unit==='%')assert.ok(v<=100,entry.id+' above 100');
  }
 }
});
test('Activity and inactivity are complementary within published rounding',()=>{
 for(const p of [...data.provinces,{values:data.benchmark.values}]){
  assert.ok(Math.abs(p.values.activity_rate+p.values.inactivity_rate-100)<0.25);
 }
});
test('Published gender employment data from OsserVa remain intact',()=>{
 const p=code=>data.provinces.find(x=>x.code===code);
 assert.equal(p('BG').values.female_employment_rate,58.45);
 assert.equal(p('MI').values.female_employment_rate,68.07);
 assert.equal(p('VA').values.male_employment_rate,78.58);
});
test('Generated data agrees with canonical JSON source',()=>{
 const m=built.match(/window\.OBSERVATORY_LOMBARDY=(.*);\s*$/);
 assert.ok(m);
 assert.deepEqual(JSON.parse(m[1]),data);
});
test('Lombardy UI has functional selector, table and export handlers',()=>{
 for(const id of ['lombardy','lombardy-indicator','lombardy-order','lombardy-highlight','lombardy-chart','lombardy-table','lombardy-export'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="data\/lombardy-2025\.js"/);
 assert.match(html,/src="lombardy\.js" defer/);
 assert.match(script,/renderTable\(marker\)/);
 assert.match(script,/function exportCsv\(\)/);
});
