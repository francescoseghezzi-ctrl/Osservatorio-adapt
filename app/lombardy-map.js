/* Interactive SVG choropleth of actual Lombardy provincial boundaries. */
(()=>{
'use strict';
function init(){
 const geo=window.OBSERVATORY_LOMBARDY_MAP;
 const data=window.OBSERVATORY_LOMBARDY;
 const $=id=>document.getElementById(id);
 if(!geo||!data||!$('lombardy-map'))return;
 const host=$('lombardy-map'),tooltip=$('lombardy-map-tooltip'),detail=$('lombardy-map-detail');
 const indicator=$('lombardy-indicator'),highlight=$('lombardy-highlight');
 const provinces=new Map(data.provinces.map(x=>[x.code,x]));
 const fmt=(n,unit)=>Number(n).toLocaleString('it-IT',{maximumFractionDigits:unit==='%'?2:0})+(unit==='%'?'%':'');
 const status={selected:highlight.value==='all'?null:highlight.value};
 // Original shortlist was only three provinces; expose every province consistently.
 const options=['<option value="all">Nessuna provincia</option>',...data.provinces.slice().sort((a,b)=>a.name.localeCompare(b.name,'it')).map(p=>'<option value="'+p.code+'">'+p.name+'</option>')].join('');
 highlight.innerHTML=options;
 highlight.value=status.selected||'all';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const maxMin=(id)=>data.provinces.reduce((acc,p)=>[Math.min(acc[0],p.values[id]),Math.max(acc[1],p.values[id])],[Infinity,-Infinity]);
 function rank(code,id,def){
  return [...data.provinces].sort((a,b)=>def.direction==='lower'?a.values[id]-b.values[id]:b.values[id]-a.values[id]).findIndex(p=>p.code===code)+1;
 }
 function color(value,min,max){
  const t=max===min?0.5:Math.max(0,Math.min(1,(value-min)/(max-min)));
  const low=[225,237,249],high=[8,124,118];
  return 'rgb('+low.map((c,i)=>Math.round(c+(high[i]-c)*t)).join(',')+')';
 }
 function changeSelection(code){
  highlight.value=code||'all';
  // One change event updates the map, ranking and table; avoid double redraw.
  highlight.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function positionTooltip(ev){
  const frame=host.parentElement.getBoundingClientRect();
  const x=Math.min(frame.width-235,Math.max(8,ev.clientX-frame.left+14));
  const y=Math.min(frame.height-90,Math.max(8,ev.clientY-frame.top+10));
  tooltip.style.left=Math.max(8,x)+'px';tooltip.style.top=Math.max(8,y)+'px';
 }
 function showHover(ev,code){
  const p=provinces.get(code);
  const def=data.indicators.find(d=>d.id===indicator.value);
  const benchmark=data.benchmark.values[def.id];
  const gap=p.values[def.id]-benchmark;
  tooltip.innerHTML='<strong>'+escape(p.name)+'</strong>'+escape(def.label)+': <b>'+fmt(p.values[def.id],def.unit)+'</b>'+
   '<div>Posizione: '+(def.group==='stock'?'non applicabile':rank(code,def.id,def)+' / 12')+'</div>'+
   (def.group==='rate'?'<div>Scarto Lombardia: '+(gap>0?'+':'')+Number(gap).toLocaleString('it-IT',{maximumFractionDigits:2})+' p.p.</div>':'<div>Valore assoluto, non normalizzato</div>');
  tooltip.hidden=false;
  if(ev&&typeof ev.clientX==='number')positionTooltip(ev);
 }
 function hideHover(){tooltip.hidden=true;}
 function details(){
  const def=data.indicators.find(d=>d.id===indicator.value);
  const selected=status.selected?provinces.get(status.selected):null;
  if(!selected){
   detail.innerHTML='<h3>Seleziona una provincia</h3><p>Passa con il mouse su un confine per vedere i dati. Clicca o usa Tab e Invio per fissare una provincia; potrai consultarne i dieci indicatori qui.</p>';
   return;
  }
  const value=selected.values[def.id],benchmark=data.benchmark.values[def.id];
  const gap=value-benchmark;
  const summary=def.group==='rate'?'Scarto dalla Lombardia: '+(gap>0?'+':'')+Number(gap).toLocaleString('it-IT',{maximumFractionDigits:2})+' punti percentuali. Posizione: '+rank(selected.code,def.id,def)+' su 12.':'Valore assoluto espresso in migliaia; il numero non indica una performance migliore o peggiore.';
  detail.innerHTML='<div class="metric-label">Provincia selezionata</div><h3>'+escape(selected.name)+'</h3><div class="metric-label">'+escape(def.label)+'</div><div class="metric-value">'+fmt(value,def.unit)+'</div><p>'+escape(summary)+'</p><div class="rowstat"><span>Lombardia · '+escape(def.label)+'</span><strong>'+fmt(benchmark,def.unit)+'</strong></div>'+
    data.indicators.filter(x=>x.id!==def.id&&x.group==='rate').map(x=>'<div class="rowstat"><span>'+escape(x.label)+'</span><strong>'+fmt(selected.values[x.id],x.unit)+'</strong></div>').join('')+
    '<p>I tassi e gli stock hanno denominatori differenti. Fonte: Rilevazione ISTAT sulle forze di lavoro, 2025.</p>';
 }
 function draw(){
  const def=data.indicators.find(x=>x.id===indicator.value);
  if(!def)return;
  const [low,high]=maxMin(def.id);
  const source=geo.provinces;
  let html='<svg viewBox="'+geo.viewBox+'" role="img" aria-label="Mappa provinciale Lombardia: '+escape(def.label)+'">';
  for(const s of source){
   const p=provinces.get(s.code);if(!p)continue;
   const active=status.selected===s.code;
   const val=p.values[def.id];
   html+='<path class="lombardy-map-path'+(active?' is-selected':'')+'" data-code="'+s.code+'" d="'+s.path+'" fill="'+color(val,low,high)+'" fill-rule="evenodd" tabindex="0" role="button" aria-label="'+escape(p.name)+', '+escape(def.label)+': '+fmt(val,def.unit)+'" aria-pressed="'+active+'"><title>'+escape(p.name)+': '+fmt(val,def.unit)+'</title></path>';
  }
  html+='</svg>';
  host.innerHTML=html;
  $('lombardy-map-legend').innerHTML='<span>'+fmt(low,def.unit)+'</span><span class="lombardy-legend-ramp" aria-hidden="true"></span><span>'+fmt(high,def.unit)+'</span><span>Valori '+(def.group==='rate'?'percentuali':'assoluti in migliaia')+'</span>';
  for(const node of host.querySelectorAll('.lombardy-map-path')){
   const code=node.dataset.code;
   node.addEventListener('pointerenter',ev=>showHover(ev,code));
   node.addEventListener('pointermove',ev=>positionTooltip(ev));
   node.addEventListener('pointerleave',hideHover);
   node.addEventListener('focus',()=>showHover(null,code));
   node.addEventListener('blur',hideHover);
   node.addEventListener('click',()=>{hideHover();changeSelection(code)});
   node.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();hideHover();changeSelection(code);const newNode=host.querySelector('[data-code="'+code+'"]');newNode?.focus({preventScroll:true});}});
  }
  details();
 }
 highlight.addEventListener('change',()=>{status.selected=highlight.value==='all'?null:highlight.value;draw()});
 indicator.addEventListener('change',()=>{hideHover();draw()});
 $('lombardy-map-reset').addEventListener('click',()=>changeSelection('BG'));
 draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();