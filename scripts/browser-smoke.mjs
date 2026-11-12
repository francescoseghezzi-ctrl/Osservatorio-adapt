import http from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {extname,resolve,sep} from 'node:path';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {strict as assert} from 'node:assert';

const root=resolve(fileURLToPath(new URL('../app/',import.meta.url)));
const html=readFileSync(resolve(root,'index.html'),'utf8');
const smoke=String.raw`
<script>
window.addEventListener('load',()=>{
 const checks=[];
 function check(name,ok){checks.push({name,ok:Boolean(ok)});}
 try{
  const $=id=>document.getElementById(id);
  check('12 province on the map',document.querySelectorAll('.lombardy-map-path').length===12);
  check('province labels are accessible',!!document.querySelector('.lombardy-map-path[tabindex="0"][aria-label]'));
  const bs=document.querySelector('.lombardy-map-path[data-code="BS"]');
  bs?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  check('click selects Brescia',$('lombardy-highlight')?.value==='BS' && $('lombardy-map-detail')?.textContent.includes('Brescia'));
  check('map shows selected border',!!document.querySelector('.lombardy-map-path[data-code="BS"].is-selected'));
  $('lombardy-indicator').value='female_employment_rate';
  $('lombardy-indicator').dispatchEvent(new Event('change',{bubbles:true}));
  check('indicator change refreshes map and detail',$('lombardy-map-detail')?.textContent.includes('56,82') && $('lombardy-title')?.textContent.includes('femminile'));
  check('ranking chart renders',!!$('lombardy-chart')?.querySelector('svg'));
  check('table contains all provinces',$('lombardy-table')?.querySelectorAll('tbody tr').length===13);
  const mi=document.querySelector('.lombardy-map-path[data-code="MI"]');
  mi?.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  check('keyboard activates province',$('lombardy-highlight')?.value==='MI');
  const so=document.querySelector('.lombardy-map-path[data-code="SO"]');
  so?.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false}));
  check('hover tooltip',!$('lombardy-map-tooltip').hidden && $('lombardy-map-tooltip').textContent.includes('Sondrio'));
  $('lombardy-map-reset')?.click();
  check('reset selects Bergamo',$('lombardy-highlight').value==='BG');
  check('no numerical rendering errors',!$('lombardy-map').innerHTML.includes('NaN'));
  if(new URLSearchParams(location.search).has('mobile')){
    const width=window.innerWidth;
    check('mobile viewport and map fit',width<800 && $('lombardy-map').getBoundingClientRect().width<=width);
    check('mobile map is visible',$('lombardy-map').getBoundingClientRect().height>100);
  }
 }catch(e){check('runtime exception '+String(e),false);}
 const failures=checks.filter(x=>!x.ok);
 const report=document.createElement('pre');
 report.id='smoke-report';
 report.textContent=JSON.stringify({ok:failures.length===0,checks});
 document.body.appendChild(report);
 document.body.dataset.smoke=failures.length===0?'passed':'failed';
});
</script>
`;
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const path=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file=resolve(root,path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  const data=url.pathname==='/'?html.replace('</body>',''+smoke+'</body>'):readFileSync(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});
  res.end(data);
 }catch(e){res.writeHead(404).end('Not found');}
});
async function launch(url,viewport,label){
 const bins=[process.env.CHROME_BIN,'google-chrome','chromium','chromium-browser'].filter(Boolean);
 let last;
 for(const bin of bins){
  try{
   const result=await new Promise((resolvePromise,reject)=>{
    const child=spawn(bin,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--disable-background-networking','--disable-extensions','--hide-scrollbars',
      '--virtual-time-budget=6000','--window-size='+viewport,
      '--user-data-dir='+join(tmpdir(),'obs-smoke-'+process.pid+'-'+label),
      '--dump-dom',url],{stdio:['ignore','pipe','pipe']});
    let out='',err='',timed=false;
    const timer=setTimeout(()=>{timed=true;child.kill('SIGKILL')},35000);
    child.stdout.on('data',b=>out+=b);
    child.stderr.on('data',b=>err+=b);
    child.on('error',e=>{clearTimeout(timer);reject(e)});
    child.on('close',code=>{clearTimeout(timer);resolvePromise({code,out,err,timed})});
   });
   if(!result.out.includes('id="smoke-report"'))throw Error('No browser report; '+result.err.slice(-1000));
   const match=result.out.match(/<pre id="smoke-report">([^<]+)<\/pre>/);
   if(!match)throw Error('Unparseable browser result');
   const report=JSON.parse(match[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
   for(const item of report.checks)console.log((item.ok?'PASS':'FAIL')+' ['+label+'] '+item.name);
   assert.equal(report.ok,true,label+' browser checks failed');
   return;
  }catch(e){last=e;if(!String(e).includes('ENOENT'))break;}
 }
 throw last;
}
await new Promise(resolvePromise=>server.listen(0,'127.0.0.1',resolvePromise));
try{
 const base='http://127.0.0.1:'+server.address().port+'/';
 await launch(base,'1440,900','desktop');
 await launch(base+'?mobile','390,844','mobile');
}finally{await new Promise(resolvePromise=>server.close(resolvePromise));}
