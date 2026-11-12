import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'data/bergamo-annual.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(resolve(root, 'data/catalog.json'), 'utf8'));
const defs = catalog.indicators.map(x=>({key:x.id,title:x.label,unit:x.unit,group:x.group}));
const destination = resolve(root,'app/data/bergamo-series.js');
const content = '/* Generated from data/bergamo-annual.json and data/catalog.json; edit source files, then regenerate. */\n'
 + 'window.OBSERVATORY_DATA='+JSON.stringify({rows:data.rows,defs})+';\n';
if(process.argv.includes('--check')){
  if(readFileSync(destination,'utf8')!==content){
    console.error('Generated dashboard dataset is out of sync; run npm run build:data.');
    process.exitCode=1;
  } else {
    console.log('Generated dashboard dataset is synchronized.');
  }
} else {
  writeFileSync(destination,content);
  console.log('Updated '+destination);
}
