import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const geographyCode=read('../app/data/lombardy-boundaries.js');
const mapCode=read('../app/lombardy-map.js');
const html=read('../app/index.html');
const data=JSON.parse(read('../data/lombardy-provinces-2025.json'));
const m=geographyCode.match(/window\.OBSERVATORY_LOMBARDY_MAP=(.*);\s*$/);
assert.ok(m,'Map geography payload should parse');
const geography=JSON.parse(m[1]);
test('Map shapes cover exactly the twelve provinces in the indicator dataset',()=>{
 const mapCodes=geography.provinces.map(x=>x.code).sort();
 const indicatorCodes=data.provinces.map(x=>x.code).sort();
 assert.deepEqual(mapCodes,indicatorCodes);
 assert.equal(new Set(mapCodes).size,12);
 assert.equal(geography.provinces.length,12);
});
test('Map boundaries use actual projected polygons, not placeholders',()=>{
 for(const p of geography.provinces){
  assert.ok(p.path.startsWith('M'),p.code+' missing SVG polygon');
  assert.ok(p.path.includes('Z'),p.code+' is not closed');
  assert.ok(p.path.length>400,p.code+' unusually short path');
  assert.ok(!/NaN|Infinity|undefined/.test(p.path));
 }
 assert.match(geography.source_url,/limits_IT_provinces\.topo\.json/);
});
test('Map has click, keyboard, hover and selector synchronization',()=>{
 for(const id of ['lombardy-map','lombardy-map-detail','lombardy-map-tooltip','lombardy-map-legend','lombardy-map-reset']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/src="data\/lombardy-boundaries\.js"/);
 assert.match(html,/src="lombardy-map\.js" defer/);
 assert.match(mapCode,/pointerenter/);
 assert.match(mapCode,/keydown/);
 assert.match(mapCode,/dispatchEvent\(new Event\('change'/);
 assert.match(mapCode,/highlight\.addEventListener\('change'/);
 assert.match(mapCode,/indicator\.addEventListener\('change'/);
});
test('Color scale is normalized to selected values without hiding stock-unit caveat',()=>{
 assert.match(mapCode,/maxMin\(def\.id\)/);
 assert.match(mapCode,/def\.group==='stock'/);
 assert.match(mapCode,/non indica una performance/);
});
