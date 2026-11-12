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


// The two additional datasets are maintained independently: projected demand (Excelsior)
// and administrative employment flows (COB) must not share an aggregate scale.
const excelsior=JSON.parse(readFileSync(resolve(root,'data/excelsior-monthly.json'),'utf8'));
const cob=JSON.parse(readFileSync(resolve(root,'data/cob-annual.json'),'utf8'));
const flowsDestination=resolve(root,'app/data/flows-series.js');
const flowsContent='/* Generated from data/excelsior-monthly.json and data/cob-annual.json */\n'
 + 'window.OBSERVATORY_FLOWS='+JSON.stringify({excelsior,cob})+';\n';
if(process.argv.includes('--check')){
  if(readFileSync(flowsDestination,'utf8')!==flowsContent){
    console.error('Generated flows dataset is out of sync; run npm run build:data.');
    process.exitCode=1;
  }
} else {
  writeFileSync(flowsDestination,flowsContent);
}

const demography=JSON.parse(readFileSync(resolve(root,'data/demography-annual.json'),'utf8'));
const demographicDestination=resolve(root,'app/data/demography-series.js');
const demographicContent='/* Generated from data/demography-annual.json */\n'
 + 'window.OBSERVATORY_DEMOGRAPHY='+JSON.stringify(demography)+';\n';
if(process.argv.includes('--check')){
  if(readFileSync(demographicDestination,'utf8')!==demographicContent){
    console.error('Generated demographic dataset is out of sync; run npm run build:data.');
    process.exitCode=1;
  }
} else {
  writeFileSync(demographicDestination,demographicContent);
}

const censusEmployment=JSON.parse(readFileSync(resolve(root,'data/employed-age-census.json'),'utf8'));
const censusDest=resolve(root,'app/data/employed-age-census.js');
const censusContent='/* Generated from data/employed-age-census.json */\n'
 + 'window.OBSERVATORY_EMPLOYED_BY_AGE='+JSON.stringify(censusEmployment)+';\n';
if(process.argv.includes('--check')){
  if(readFileSync(censusDest,'utf8')!==censusContent){
    console.error('Generated age-specific employment census data is out of sync; run npm run build:data.');
    process.exitCode=1;
  }
} else {
  writeFileSync(censusDest,censusContent);
}

const inpsAge=JSON.parse(readFileSync(resolve(root,'data/inps-age-monthly-mean.json'),'utf8'));
const inpsSector=JSON.parse(readFileSync(resolve(root,'data/inps-sector-annual.json'),'utf8'));
const inpsQual=JSON.parse(readFileSync(resolve(root,'data/inps-sector-qualifications.json'),'utf8'));
const inpsDestination=resolve(root,'app/data/inps-distributions.js');
const inpsContent='/* Generated from data/inps-age-monthly-mean.json, data/inps-sector-annual.json, and data/inps-sector-qualifications.json */\n'
 + 'window.OBSERVATORY_INPS='+JSON.stringify({age:inpsAge,sector:inpsSector,qualifications:inpsQual})+';\n';
if(process.argv.includes('--check')){
 if(readFileSync(inpsDestination,'utf8')!==inpsContent){
  console.error('Generated INPS distributions are out of sync; run npm run build:data.');
  process.exitCode=1;
 }
}else{
 writeFileSync(inpsDestination,inpsContent);
}
