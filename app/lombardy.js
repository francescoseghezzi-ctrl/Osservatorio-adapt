/* Comparison across 12 Lombardy provinces. Annual ISTAT survey estimates, 2025. */
(()=>{
'use strict';
const data=window.OBSERVATORY_LOMBARDY;
const $=id=>document.getElementById(id);
if(!data || !$('lombardy-indicator'))return;
const defs=data.indicators,provinces=data.provinces;
const fmt=(n,unit)=>Number(n).toLocaleString('it-IT',{maximumFractionDigits:unit==='%'?2:0})+(unit==='%'?'%':'');
const labelOf=id=>defs.find(d=>d.id===id);
function selectedProvinces(){
 const id=$('lombardy-indicator').value,order=$('lombardy-order').value;
 const rows=[...provinces];
 if(order==='alphabetical')rows.sort((a,b)=>a.name.localeCompare(b.name,'it'));
 else rows.sort((a,b)=>order==='ascending'?a.values[id]-b.values[id]:b.values[id]-a.values[id]);
 return rows;
}
function render(){
 const id=$('lombardy-indicator').value,def=labelOf(id),rows=selectedProvinces();
 const marker=$('lombardy-highlight').value;
 const benchmark=data.benchmark.values[id];
 const highest=[...provinces].sort((a,b)=>b.values[id]-a.values[id])[0];
 const lowest=[...provinces].sort((a,b)=>a.values[id]-b.values[id])[0];
 const selected=provinces.find(x=>x.code===marker);
 $('lombardy-title').textContent=def.label;
 $('lombardy-subtitle').textContent='2025 · '+(def.group==='stock'?'stime in migliaia di persone':'tasso percentuale')+' · ISTAT';
 const card=(label,value,note)=>'<div class="card"><div class="metric-label">'+label+'</div><div class="metric-value" style="font-size:26px">'+value+'</div><div class="metric-sub">'+note+'</div></div>';
 $('lombardy-kpis').innerHTML=[
 card('Media / totale regionale',fmt(benchmark,def.unit),def.unit==='%'?'Benchmark Lombardia':'Stock regionale stimato'),
 card('Valore massimo',fmt(highest.values[id],def.unit),highest.name),
 card('Valore minimo',fmt(lowest.values[id],def.unit),lowest.name),
 card(selected?'Differenza '+selected.name:'Province confrontate',selected?(selected.values[id]-benchmark>0?'+':'')+fmt(selected.values[id]-benchmark,def.unit==='%'?'%':'migliaia'):'12',selected?(def.unit==='%'?'Punti percentuali dalla Lombardia':'Migliaia rispetto al totale lombardo'):'Tutte le province lombarde')
 ].join('');
 const W=990,H=575,L=215,R=105,T=35,B=22;
 const start=Math.min(0,...rows.map(r=>r.values[id]),benchmark);
 const stop=Math.max(...rows.map(r=>r.values[id]),benchmark);
 const zeroBase=start===0;
 const max=stop*1.08||1;
 const x=v=>L+(W-L-R)*(v-start)/(max-start);
 const base=x(start),maxWidth=W-R-L;
 const trackY=i=>T+i*43;
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+def.label+', valori delle province lombarde anno 2025">';
 rows.forEach((r,i)=>{
   const value=r.values[id],y=trackY(i),bar=Math.max(2,x(value)-base);
   const active=marker===r.code,color=active?'#087c76':'#7899ad';
   svg+='<text x="'+(L-12)+'" y="'+(y+18)+'" fill="'+(active?'#075e5a':'#405f73')+'" text-anchor="end" font-size="15" font-weight="'+(active?'800':'500')+'">'+r.name+'</text>';
   svg+='<rect x="'+base+'" y="'+y+'" width="'+maxWidth+'" height="25" rx="5" fill="#ecf2f6"/>';
   svg+='<rect x="'+base+'" y="'+y+'" width="'+bar+'" height="25" rx="5" fill="'+color+'"><title>'+r.name+': '+fmt(value,def.unit)+'</title></rect>';
   svg+='<text x="'+Math.min(W-R+7,x(value)+8)+'" y="'+(y+18)+'" font-size="14" fill="#28495d" font-weight="700">'+fmt(value,def.unit)+'</text>';
 });
 const bx=x(benchmark);
 svg+='<line x1="'+bx+'" y1="'+(T-10)+'" x2="'+bx+'" y2="'+(T+rows.length*43-9)+'" stroke="#c26e29" stroke-width="2" stroke-dasharray="6 4"/>';
 svg+='<text x="'+bx+'" y="'+(T-16)+'" fill="#a05c20" font-size="13" text-anchor="middle">Lombardia '+fmt(benchmark,def.unit)+'</text>';
 $('lombardy-chart').innerHTML=svg+'</svg>';
 const rank=[...provinces].sort((a,b)=>def.direction==='lower'?a.values[id]-b.values[id]:b.values[id]-a.values[id]);
 if(def.group==='stock'){
   $('lombardy-context').textContent='Valori assoluti: la dimensione della popolazione condiziona l’ordine. Milano e Brescia hanno stock maggiori anche per ragioni demografiche; non è una graduatoria di efficacia o qualità del mercato del lavoro.';
 }else if(selected){
   const pos=rank.findIndex(x=>x.code===marker)+1;
   const diff=selected.values[id]-benchmark;
   $('lombardy-context').textContent=selected.name+': '+fmt(selected.values[id],def.unit)+', scarto dalla Lombardia '+(diff>0?'+':'')+Number(diff).toLocaleString('it-IT',{maximumFractionDigits:2})+' punti percentuali. Posizione '+pos+' su 12 nell’ordinamento '+(def.direction==='lower'?'crescente':'decrescente')+'. L’indicatore va interpretato nel proprio contesto, non come indice sintetico di performance.';
 }else{
   $('lombardy-context').textContent='Ordinamento dei tassi provinciali: differenze descrittive del 2025, senza pesi o correzioni per struttura demografica.';
 }
 renderTable(marker);
}
function renderTable(marker){
 const ds=data.indicators;
 $('lombardy-table').querySelector('thead').innerHTML='<tr><th>Territorio</th>'+ds.map(d=>'<th>'+d.label+' ('+d.unit+')</th>').join('')+'</tr>';
 const row=(name,values,cls='')=>'<tr class="'+cls+'"><td>'+name+'</td>'+ds.map(d=>'<td>'+fmt(values[d.id],d.unit)+'</td>').join('')+'</tr>';
 $('lombardy-table').querySelector('tbody').innerHTML=[...provinces].sort((a,b)=>a.name.localeCompare(b.name,'it')).map(x=>row(x.name,x.values,x.code===marker?'lombardy-selected':'')).join('')+row('Lombardia',data.benchmark.values,'lombardy-benchmark');
}
function exportCsv(){
 const ds=data.indicators;
 const lines=[['territorio',...ds.map(d=>d.id)].join(';')];
 for(const r of [...provinces,{name:'Lombardia',values:data.benchmark.values}]){
  lines.push([r.name,...ds.map(d=>String(r.values[d.id]).replace('.',','))].join(';'));
 }
 const notes=['# Anno 2025; valori assoluti in migliaia; tassi percentuali','# Fonti: Camera di commercio di Varese / OsserVa e Provincia di Brescia; ISTAT Rilevazione Forze di Lavoro','# I valori assoluti sono arrotondati, non sono tassi e non sono graduatorie di performance'];
 const blob=new Blob(['\ufeff'+notes.join('\r\n')+'\r\n'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='lombardia_province_10_indicatori_2025.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),2500);
}
$('lombardy-indicator').innerHTML=defs.map(d=>'<option value="'+d.id+'">'+d.label+'</option>').join('');
for(const key of ['lombardy-indicator','lombardy-order','lombardy-highlight'])$(key).addEventListener('change',render);
$('lombardy-export').addEventListener('click',exportCsv);
render();
})();