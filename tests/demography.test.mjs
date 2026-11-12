import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const demo=JSON.parse(readFileSync(new URL('../data/demography-annual.json',import.meta.url),'utf8'));
const generated=readFileSync(new URL('../app/data/demography-series.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../app/index.html',import.meta.url),'utf8');
test('population years are continuous and reference date is explicit',()=>{
 assert.deepEqual(demo.rows.map(r=>r.year),[2019,2020,2021,2022,2023,2024,2025]);
 assert.equal(demo.reference_date,'01-01');
 assert.equal(demo.frequency,'annual');
});
test('population stocks add up and indices are numerically plausible',()=>{
 for(const row of demo.rows){
  assert.equal(row.age_0_14+row.age_15_64+row.age_65_plus,row.total);
  assert.ok(Math.abs(row.old_age_index-row.age_65_plus/row.age_0_14*100)<0.15);
  assert.ok(Math.abs(row.dependency_index-(row.age_0_14+row.age_65_plus)/row.age_15_64*100)<0.15);
  assert.ok(row.mean_age>30 && row.mean_age<65);
  assert.ok(row.workforce_replacement_index>0);
 }
});
test('browser demographic dataset and source JSON are synchronized',()=>{
 const m=generated.match(/window\.OBSERVATORY_DEMOGRAPHY=(.*);\s*$/);
 assert.ok(m);
 assert.deepEqual(JSON.parse(m[1]),demo);
});
test('demographic trend UI exists and quotes its source',()=>{
 assert.match(html,/id="demo-series"/);
 assert.match(html,/id="demo-chart"/);
 assert.match(html,/data\/demography-series\.js/);
 assert.match(html,/indici-demografici-struttura-popolazione/);
});
