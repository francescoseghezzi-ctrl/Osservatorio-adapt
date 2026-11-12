import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const catalog=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const dataset=JSON.parse(readFileSync(new URL('../data/bergamo-annual.json',import.meta.url),'utf8'));
const js=readFileSync(new URL('../app/data/bergamo-series.js',import.meta.url),'utf8');
test('catalog and dataset use the same territory',()=>{
 assert.equal(catalog.territory.id,dataset.territory);
 assert.equal(dataset.frequency,'annual');
});
test('years are strictly increasing, unique and integers',()=>{
 const years=dataset.rows.map(row=>row.year);
 assert.ok(years.length>=2);
 assert.ok(years.every(Number.isInteger));
 assert.ok(years.every((y,i)=>i===0||y>years[i-1]));
});
test('every indicator has valid complete data and declared units',()=>{
 const indicators=catalog.indicators;
 assert.equal(new Set(indicators.map(i=>i.id)).size,indicators.length);
 for(const indicator of indicators){
  assert.ok(indicator.id && indicator.label && indicator.unit && indicator.group);
  assert.equal(indicator.validation_status,'source_pending');
  assert.deepEqual(indicator.years,[dataset.rows[0].year,dataset.rows.at(-1).year]);
  for(const row of dataset.rows){
   assert.ok(Object.hasOwn(row,indicator.id), 'Missing '+indicator.id+' for '+row.year);
   const v=row[indicator.id];
   assert.ok(typeof v==='number' && Number.isFinite(v),'Non-finite '+indicator.id+' for '+row.year);
   assert.ok(v>=0, 'Negative value '+indicator.id+' for '+row.year);
   if(indicator.unit==='%')assert.ok(v<=100, 'Rate >100 for '+indicator.id+' in '+row.year);
  }
 }
});
test('generated browser dataset matches source data and catalog',()=>{
 const m=js.match(/window\.OBSERVATORY_DATA=(.*);\s*$/);
 assert.ok(m,'Browser data payload missing');
 const payload=JSON.parse(m[1]);
 assert.deepEqual(payload.rows,dataset.rows);
 assert.deepEqual(payload.defs,catalog.indicators.map(x=>({key:x.id,title:x.label,unit:x.unit,group:x.group})));
});
test('the catalog documents provenance limitations',()=>{
 assert.match(catalog.quality_note,/not independently verified/i);
 for(const i of catalog.indicators)assert.ok(i.provenance);
});
