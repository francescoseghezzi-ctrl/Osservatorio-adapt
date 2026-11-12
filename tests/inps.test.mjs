import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const age=JSON.parse(read('../data/inps-age-monthly-mean.json'));
const sector=JSON.parse(read('../data/inps-sector-annual.json'));
const generated=read('../app/data/inps-distributions.js');
const html=read('../app/index.html');
const script=read('../app/inps-explorer.js');
test('INPS age snapshots are 2018 and 2023, with documented reporting rounding',()=>{
 assert.deepEqual(age.years,[2018,2023]);
 const rows=age.rows;
 assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
 for(const year of ['2018','2023']){
  const sum=rows.reduce((n,row)=>n+row.values[year],0);
  assert.ok(Math.abs(sum-age.total[year])<=1,'Reported total mismatch '+year);
 }
 assert.match(age.scope_note,/una unità/);
});
test('INPS sector data are a selection for 2019 and 2023, not a total',()=>{
 assert.deepEqual(sector.years,[2019,2023]);
 assert.equal(new Set(sector.rows.map(x=>x.ateco)).size,sector.rows.length);
 assert.ok(sector.rows.length>0);
 assert.match(sector.scope_note,/selezione/i);
 for(const r of sector.rows) for(const year of ['2019','2023'])
  assert.ok(Number.isInteger(r.values[year]) && r.values[year]>=0);
});
test('Shared browser payload matches both source JSONs',()=>{
 const found=generated.match(/window\.OBSERVATORY_INPS=(.*);\s*$/);
 assert.ok(found);
 const p=JSON.parse(found[1]);
 assert.deepEqual(p.age,age);
 assert.deepEqual(p.sector,sector);
});
test('INPS display avoids invented cross-tabulations and states divergent scopes',()=>{
 assert.match(html,/id="inps-age-table"/);
 assert.match(html,/id="inps-sector-chart"/);
 assert.match(html,/id="inps-sector-order"/);
 assert.match(html,/data\/inps-distributions\.js/);
 assert.match(html,/src="inps-explorer\.js" defer/);
 assert.match(html,/non sono incrociati con l'età/);
 assert.match(script,/Distinct INPS series/);
 assert.doesNotMatch(script,/fetch\(/);
});
