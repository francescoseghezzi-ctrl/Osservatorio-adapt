import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=JSON.parse(readFileSync(new URL('../data/employed-age-census.json',import.meta.url),'utf8'));
const browser=readFileSync(new URL('../app/data/employed-age-census.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../app/index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('../app/workforce-age.js',import.meta.url),'utf8');
const keys=['age_15_24','age_25_49','age_50_64','age_65_plus'];
test('Census years are snapshots only; no interpolation',()=>{
 assert.deepEqual(source.rows.map(x=>x.year),[2018,2023]);
 assert.equal(source.frequency,'census_snapshot');
 assert.match(source.notes.join(' '),/not be interpolated/i);
});
test('Age groups agree with reported totals up to documented rounding',()=>{
 for(const row of source.rows){
  const sum=keys.reduce((v,k)=>v+row[k],0);
  assert.ok(Math.abs(sum-row.total)<=1,'Mismatch exceeds reporting tolerance');
  assert.ok(keys.every(k=>Number.isInteger(row[k]) && row[k]>=0));
 }
});
test('Published change in employed residents aged 50 to 64 is preserved',()=>{
 assert.equal(source.rows[1].age_50_64-source.rows[0].age_50_64,24792);
 assert.equal(source.rows[1].age_25_49-source.rows[0].age_25_49,-5784);
});
test('Browser source and UI are wired to census data',()=>{
 const m=browser.match(/window\.OBSERVATORY_EMPLOYED_BY_AGE=(.*);\s*$/);
 assert.ok(m);
 assert.deepEqual(JSON.parse(m[1]),source);
 for(const id of ['workforce-age-kpis','workforce-age-table','workforce-age-chart'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="data\/employed-age-census\.js"/);
 assert.match(html,/src="workforce-age\.js" defer/);
 assert.match(ui,/Census|census/i);
});
