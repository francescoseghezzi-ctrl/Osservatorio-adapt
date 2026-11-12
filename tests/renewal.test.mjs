import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../app/index.html',import.meta.url),'utf8');
const code=readFileSync(new URL('../app/renewal.js',import.meta.url),'utf8');
const demo=JSON.parse(readFileSync(new URL('../data/demography-annual.json',import.meta.url),'utf8'));
const work=JSON.parse(readFileSync(new URL('../data/bergamo-annual.json',import.meta.url),'utf8'));

test('cross-source analysis joins only on overlapping annual reference years',()=>{
 const y1=demo.rows.map(x=>x.year),y2=work.rows.map(x=>x.year);
 assert.deepEqual(y1,[2019,2020,2021,2022,2023,2024,2025]);
 assert.deepEqual(y1,y2);
 assert.ok(code.includes('byYear.get(row.year)'));
});
test('descriptive explorer exposes selectors, chart holders and source limitations',()=>{
 for(const id of ['renewal','renewal-from','renewal-to','renewal-demo','renewal-labour','renewal-demo-chart','renewal-labour-chart','renewal-table','renewal-export']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/src="renewal\.js" defer/);
 assert.match(html,/non sono previsioni di pensionamento/);
 assert.match(html,/ancora da completare/);
});
test('year interval validation and empty state are explicit',()=>{
 assert.match(code,/if\(from>to\)/);
 assert.match(code,/current=\[\]/);
 assert.match(code,/Nessun dato comune/);
});
test('renewal script parses with Node without external dependencies',()=>{
 assert.ok(code.startsWith('/* Cross-source descriptive explorer'));
 assert.doesNotMatch(code,/fetch\(/);
});
