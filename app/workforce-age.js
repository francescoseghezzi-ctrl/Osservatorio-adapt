/* Two-point census comparison; never interpolate missing years. */
(()=>{
'use strict';
const data=window.OBSERVATORY_EMPLOYED_BY_AGE;
const el=id=>document.getElementById(id);
if(!data || !el('workforce-age-chart'))return;
const first=data.rows.find(r=>r.year===2018);
const last=data.rows.find(r=>r.year===2023);
if(!first || !last)return;
const groups=[
 {id:'age_15_24',label:'15–24 anni'},
 {id:'age_25_49',label:'25–49 anni'},
 {id:'age_50_64',label:'50–64 anni'},
 {id:'age_65_plus',label:'65 anni e oltre'}
];
const format=(n,d=0)=>Number(n).toLocaleString('it-IT',{maximumFractionDigits:d});
const signed=(n,d=0)=>(n>0?'+':'')+format(n,d);
const card=(label,value,note)=>'<div class="card"><div class="metric-label">'+label+'</div><div class="metric-value" style="font-size:27px">'+value+'</div><div class="metric-sub">'+note+'</div></div>';
const totalChange=last.total-first.total;
const olderChange=last.age_50_64-first.age_50_64;
const youngerChange=last.age_15_24-first.age_15_24;
const olderShareFirst=first.age_50_64/first.total*100;
const olderShareLast=last.age_50_64/last.total*100;
el('workforce-age-kpis').innerHTML=[
 card('Occupati residenti nel 2023',format(last.total),'Censimento permanente · tutte le età'),
 card('Variazione occupati 2018–2023',signed(totalChange),'Differenza tra due censimenti'),
 card('Occupati 50–64: variazione',signed(olderChange),signed(olderChange/first.age_50_64*100,1)+'% sul 2018'),
 card('Quota occupati 50–64',format(olderShareLast,1)+'%',signed(olderShareLast-olderShareFirst,1)+' p.p. dal 2018')
].join('');
el('workforce-age-table').querySelector('tbody').innerHTML=
 groups.map(g=>{
 const a=first[g.id],b=last[g.id],difference=b-a,change=difference/a*100;
 return '<tr><td>'+g.label+'</td><td>'+format(a)+'</td><td>'+format(b)+'</td><td>'+signed(difference)+'</td><td>'+signed(change,1)+'%</td></tr>';
 }).join('')+
 '<tr><td><strong>Totale pubblicato</strong></td><td><strong>'+format(first.total)+'</strong></td><td><strong>'+format(last.total)+'</strong></td><td><strong>'+signed(totalChange)+'</strong></td><td><strong>'+signed(totalChange/first.total*100,1)+'%</strong></td></tr>';
const W=840,H=320,L=150,R=125,T=30,B=43;
const max=Math.max(...groups.flatMap(g=>[first[g.id],last[g.id]]));
const colors=['#087c76','#8066d9'];
const plot=W-L-R;
let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Occupati per fascia età nel 2018 e 2023, dati censuari">';
groups.forEach((g,i)=>{
 const a=first[g.id],b=last[g.id],top=T+i*66;
 svg+='<text x="'+(L-13)+'" y="'+(top+28)+'" text-anchor="end" fill="#3c5d70" font-size="14">'+g.label+'</text>';
 for(const [j,n] of [[0,a],[1,b]]){
  const width=n/max*plot;
  svg+='<rect x="'+L+'" y="'+(top+j*24)+'" width="'+width+'" height="18" rx="3" fill="'+colors[j]+'"><title>'+g.label+', '+(j===0?'2018':'2023')+': '+format(n)+'</title></rect>';
  svg+='<text x="'+(L+width+7)+'" y="'+(top+j*24+14)+'" fill="#456477" font-size="12">'+format(n)+'</text>';
 }
});
svg+='<text x="'+L+'" y="'+(H-10)+'" fill="'+colors[0]+'" font-size="13">■ 2018</text><text x="'+(L+95)+'" y="'+(H-10)+'" fill="'+colors[1]+'" font-size="13">■ 2023</text>';
svg+='</svg>';
el('workforce-age-chart').innerHTML=svg;
})();