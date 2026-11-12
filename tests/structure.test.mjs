import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
const hrefs = [...html.matchAll(/\bhref="#([^"]+)"/g)].map(x=>x[1]);
test('HTML has a responsive viewport and title',()=>{
  assert.match(html, /name="viewport"/);
  assert.match(html, /<title>[^<]+<\/title>/);
});
test('ids are unique',()=>{
  assert.equal(new Set(ids).size, ids.length, 'Duplicated ids');
});
test('internal navigation anchors point to real sections',()=>{
  for(const ref of hrefs) assert.ok(ids.includes(ref), `Missing #${ref}`);
});
test('required sections exist',()=>{
  for(const id of ['overview','labour','sectors','gender','demography','compare','sources','timeseries'])
    assert.ok(ids.includes(id), `Missing section ${id}`);
});
test('preserves source and methodological qualifications',()=>{
  assert.match(html, /ISTAT/i);
  assert.match(html, /metodolog/i);
});
test('only local chart data script dependency',()=>{
  assert.match(html, /<script src="data\/bergamo-series\.js"><\/script>/);
  assert.doesNotMatch(html, /<script\s+src="https?:/i);
});
