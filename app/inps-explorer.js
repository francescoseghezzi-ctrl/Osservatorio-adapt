/* Distinct INPS series: age 2018/2023 and sector 2019/2023; no inferred age-by-sector matrix. */
(()=>{
'use strict';
const data=window.OBSERVATORY_INPS;
const $=id=>document.getElementById(id);
if(!data||!$('inps-age-chart')||!$('inps-sector-chart'))return;
const fmt=(x,d=0)=>Number(x).toLocaleString('it-IT',{maximumFractionDigits:d});
const signed=(x,d=0)=>(x>0?'+':'')+fmt(x,d);
function cards(items){return items.map(x=>'<div class="card"><div class="metric-label">'+x[0]+'</div><div class="metric-value" style="font-size:27px">'+x[1]+'</div><div class="metric-sub">'+x[2]+'</div></div>').join('');}
function drawAge(){
 const rows=data.age.rows;
 const yearA='2018',yearB='2023';
 const older=rows.filter(r=>['50_54','55_59','60_64','over_65'].includes(r.id));
 const olderA=older.reduce((s,r)=>s+r.values[yearA],0);
 const olderB=older.reduce((s,r)=>s+r.values[yearB],0);
 const totalA=data.age.total[yearA],totalB=data.age.total[yearB];
 $('inps-age-kpis').innerHTML=cards([
 ['Dipendenti 2023',fmt(totalB),'Media annua, lavoratori nel mese'],
 ['Variazione dipendenti',signed(totalB-totalA),yearA+'–'+yearB],
 ['Dipendenti 50 anni e più',fmt(olderB),'Somma delle classi 50+'],
 ['Quota 50+ nel 2023',fmt(olderB/totalB*100,1)+'%',signed((olderB/totalB-olderA/totalA)*100,1)+' p.p. rispetto al 2018']
 ]);
 $('inps-age-table').querySelector('tbody').innerHTML=rows.map(r=>{
 const a=r.values[yearA],b=r.values[yearB],delta=b-a;
 return '<tr><td>'+r.label+'</td><td>'+fmt(a)+'</td><td>'+fmt(b)+'</td><td>'+signed(delta)+'</td><td>'+signed(delta/a*100,1)+'%</td></tr>';
 }).join('')+
 '<tr><td><strong>Totale pubblicato</strong></td><td>'+fmt(totalA)+'</td><td>'+fmt(totalB)+'</td><td>'+signed(totalB-totalA)+'</td><td>'+signed((totalB-totalA)/totalA*100,1)+'%</td></tr>';
 const W=900,H=520,L=100,R=70,T=24,B=52,plotW=W-L-R,plotH=H-T-B,mx=Math.max(...rows.flatMap(r=>[r.values[yearA],r.values[yearB]]));
 const group=plotW/rows.length,barWidth=Math.min(25,group*.32);
 let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Confronto del numero medio di lavoratori dipendenti per classe quinquennale: 2018 e 2023">';
 for(let i=0;i<5;i++){const v=mx*i/4,y=T+plotH*(1-i/4);out+='<line x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'" stroke="#dde8f1"/><text x="'+(L-9)+'" y="'+(y+4)+'" text-anchor="end" fill="#637e8f" font-size="12">'+fmt(v)+'</text>';}
 rows.forEach((r,i)=>{const x=L+group*i+group*.17;for(const [j,year,color] of [[0,yearA,'#087c76'],[1,yearB,'#7a5cff']]){const v=r.values[year],height=plotH*v/mx;out+='<rect x="'+(x+j*(barWidth+3))+'" y="'+(T+plotH-height)+'" width="'+barWidth+'" height="'+height+'" fill="'+color+'" rx="2"><title>'+r.label+' '+year+': '+fmt(v)+'</title></rect>';}out+='<text x="'+(L+group*(i+.5))+'" y="'+(H-26)+'" text-anchor="middle" fill="#627b8d" font-size="11">'+r.label+'</text>';});
 out+='<text x="'+L+'" y="'+(H-6)+'" fill="#087c76" font-size="12">■ 2018</text><text x="'+(L+85)+'" y="'+(H-6)+'" fill="#7a5cff" font-size="12">■ 2023</text></svg>';
 $('inps-age-chart').innerHTML=out;
}
function drawSector(){
 const order=$('inps-sector-order').value;
 let rows=[...data.sector.rows];
 const delta=r=>r.values['2023']-r.values['2019'];
 if(order==='growth')rows.sort((a,b)=>delta(b)-delta(a));
 else if(order==='size')rows.sort((a,b)=>b.values['2023']-a.values['2023']);
 else rows.sort((a,b)=>a.label.localeCompare(b.label,'it'));
 $('inps-sector-table').querySelector('tbody').innerHTML=rows.map(r=>{
 const a=r.values['2019'],b=r.values['2023'],v=b-a;
 return '<tr><td>'+r.ateco+'</td><td style="text-align:left">'+r.label+'</td><td>'+fmt(a)+'</td><td>'+fmt(b)+'</td><td>'+signed(v)+'</td><td>'+signed(v/a*100,1)+'%</td></tr>';
 }).join('');
 const W=920,H=495,L=235,R=125,T=26,B=20,barH=15,gap=46,baseline=470,scale=Math.max(...rows.map(r=>Math.abs(delta(r))))||1;
 let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Variazione in numero di dipendenti per ciascun settore ATECO selezionato">';
 out+='<line x1="'+baseline+'" y1="'+T+'" x2="'+baseline+'" y2="'+(H-B)+'" stroke="#829dad" stroke-width="1.5"/>';
 rows.forEach((r,i)=>{
  const v=delta(r),y=T+i*gap,len=Math.abs(v)/scale*290,x=v>=0?baseline:baseline-len,col=v>=0?'#087c76':'#c77758';
  out+='<text x="'+(L-18)+'" y="'+(y+13)+'" text-anchor="end" font-size="12" fill="#456274">'+r.ateco+' · '+r.label+'</text>';
  out+='<rect x="'+x+'" y="'+y+'" width="'+Math.max(1,len)+'" height="'+barH+'" rx="2" fill="'+col+'"><title>'+r.label+': '+signed(v)+' dipendenti dal 2019 al 2023</title></rect>';
  out+='<text x="'+(v>=0?x+len+7:x-7)+'" y="'+(y+12)+'" text-anchor="'+(v>=0?'start':'end')+'" font-size="12" fill="#435f70">'+signed(v)+'</text>';
 });
 $('inps-sector-chart').innerHTML=out+'</svg>';
}

function drawQualifications(){
 const qual=$('inps-qualification').value,sectorLabels=new Map(data.sector.rows.map(r=>[r.ateco,r.label]));
 const rows=data.qualifications.rows.map(r=>({
  ateco:r.ateco,label:sectorLabels.get(r.ateco)||r.ateco,
  a:r.qualifications[qual]['2019'],b:r.qualifications[qual]['2023']
 })).sort((a,b)=>(b.b-b.a)-(a.b-a.a));
 const delta=r=>r.b-r.a;
 $('inps-qualification-table').querySelector('tbody').innerHTML=rows.map(r=>'<tr><td>'+r.ateco+'</td><td style="text-align:left">'+r.label+'</td><td>'+fmt(r.a)+'</td><td>'+fmt(r.b)+'</td><td>'+signed(delta(r))+'</td><td>'+signed(delta(r)/r.a*100,1)+'%</td></tr>').join('');
 const W=920,H=500,L=235,R=125,T=24,baseline=460,step=46,barH=16,max=Math.max(1,...rows.map(r=>Math.abs(delta(r))));
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Variazione 2019-2023 di '+qual+' nei settori ATECO selezionati">';
 svg+='<line x1="'+baseline+'" y1="'+T+'" x2="'+baseline+'" y2="'+(H-20)+'" stroke="#8aa4b4"/>';
 rows.forEach((r,i)=>{
   const v=delta(r),y=T+i*step,w=Math.abs(v)/max*280,x=v<0?baseline-w:baseline;
   svg+='<text x="'+(L-18)+'" y="'+(y+13)+'" fill="#415f70" font-size="12" text-anchor="end">'+r.ateco+' · '+r.label+'</text>';
   svg+='<rect x="'+x+'" y="'+y+'" width="'+Math.max(1,w)+'" height="'+barH+'" fill="'+(v>=0?'#087c76':'#c77758')+'" rx="3"><title>'+r.label+': '+signed(v)+'</title></rect>';
   svg+='<text x="'+(v>=0?x+w+7:x-7)+'" y="'+(y+13)+'" text-anchor="'+(v>=0?'start':'end')+'" font-size="12" fill="#486677">'+signed(v)+'</text>';
 });
 $('inps-qualification-chart').innerHTML=svg+'</svg>';
}
$('inps-qualification').addEventListener('change',drawQualifications);
$('inps-sector-order').addEventListener('change',drawSector);
drawAge();drawSector();drawQualifications();
})();