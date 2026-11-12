import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const excelsior=read('../data/excelsior-monthly.json');
const cob=read('../data/cob-annual.json');
const html=readFileSync(new URL('../app/index.html',import.meta.url),'utf8');
const output=readFileSync(new URL('../app/data/flows-series.js',import.meta.url),'utf8');
test('Excelsior dataset is continuous from 2022-01 to 2025-06',()=>{
 const months=excelsior.rows.map(r=>r.period);
 assert.equal(months.length,42);
 assert.equal(months[0],'2022-01');
 assert.equal(months.at(-1),'2025-06');
 assert.equal(new Set(months).size,months.length);
 for(let i=1;i<months.length;i++){
  const [y,m]=months[i-1].split('-').map(Number);
  const next=y*12+m;
  const [ny,nm]=months[i].split('-').map(Number);
  assert.equal(ny*12+nm,next+1);
 }
 for(const r of excelsior.rows){
  assert.ok(Number.isInteger(r.planned_entries)&&r.planned_entries>=0);
  assert.ok(r.hard_to_fill_percent>=0 && r.hard_to_fill_percent<=100);
 }
});
test('COB annual series balances equal hires minus terminations',()=>{
 assert.deepEqual(cob.rows.map(r=>r.year),[2019,2020,2021,2022,2023,2024]);
 for(const r of cob.rows){
  assert.ok(Number.isInteger(r.hires)&&Number.isInteger(r.terminations)&&Number.isInteger(r.net));
  assert.equal(r.hires-r.terminations,r.net,'COB balance mismatch '+r.year);
 }
});
test('browser payload is identical to source datasets',()=>{
 const matched=output.match(/window\.OBSERVATORY_FLOWS=(.*);\s*$/);
 assert.ok(matched);
 const payload=JSON.parse(matched[1]);
 assert.deepEqual(payload.excelsior,excelsior);
 assert.deepEqual(payload.cob,cob);
});
test('new datasets are displayed separately with linked sources',()=>{
 assert.match(html,/id="flows"/);
 assert.match(html,/id="flows-year"/);
 assert.match(html,/data\/flows-series\.js/);
 assert.match(html,/Le entrate previste non coincidono con le assunzioni effettuate/);
 assert.match(html,/Rapporto annuale 2024/);
});
