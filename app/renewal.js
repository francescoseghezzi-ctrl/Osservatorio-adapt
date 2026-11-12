/* Cross-source descriptive explorer. No predictive claims. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const demography=window.OBSERVATORY_DEMOGRAPHY;
const labour=window.OBSERVATORY_DATA;
if(!demography || !labour || !$('renewal-demo'))return;
const definitions={
 age_15_64:{label:'Residenti 15–64 anni',unit:'persone',digits:0},
 age_0_14:{label:'Residenti 0–14 anni',unit:'persone',digits:0},
 age_65_plus:{label:'Residenti di 65 anni e oltre',unit:'persone',digits:0},
 dependency_index:{label:'Indice di dipendenza strutturale',unit:'punti',digits:1},
 workforce_replacement_index:{label:'Indice di ricambio della popolazione attiva',unit:'punti',digits:1},
 employment_rate:{label:'Tasso di occupazione 15–64',unit:'%',digits:1},
 inactivity_rate:{label:'Tasso di inattività 15–64',unit:'%',digits:1},
 unemployment_rate:{label:'Tasso di disoccupazione 15–74',unit:'%',digits:1}
};
const format=(n,d)=>Number(n).toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:d});
const signed=(n,d)=>(n>0?'+':'')+format(n,d);
function line(rows,key,color,label,digits){
 const W=700,H=260,L=78,R=20,T=24,B=44;
 const values=rows.map(r=>r[key]);
 const low=Math.min(...values),high=Math.max(...values);
 const pad=Math.max((high-low)*0.18,high===low?1:(digits===0?100:0.35));
 const min=Math.max(0,low-pad),max=high+pad;
 const x=i=>L+(W-L-R)*(rows.length===1?0.5:i/(rows.length-1));
 const y=value=>T+(max-value)/(max-min)*(H-T-B);
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+label+' nel periodo selezionato">';
 for(let k=0;k<5;k++){
  const v=min+(max-min)*k/4,Y=y(v);
  svg+='<line x1="'+L+'" y1="'+Y+'" x2="'+(W-R)+'" y2="'+Y+'" stroke="#dce7ee"/>';
  svg+='<text x="'+(L-12)+'" y="'+(Y+4)+'" font-size="12" text-anchor="end" fill="#627b8d">'+format(v,digits)+'</text>';
 }
 svg+='<polyline fill="none" stroke="'+color+'" stroke-width="3.5" stroke-linejoin="round" points="'+rows.map((r,i)=>x(i)+','+y(r[key])).join(' ')+'"/>';
 rows.forEach((r,i)=>{
  svg+='<circle cx="'+x(i)+'" cy="'+y(r[key])+'" r="5" fill="white" stroke="'+color+'" stroke-width="3"><title>'+r.year+': '+format(r[key],digits)+'</title></circle>';
  svg+='<text x="'+x(i)+'" y="'+(H-14)+'" text-anchor="middle" font-size="12" fill="#627b8d">'+r.year+'</text>';
 });
 return svg+'</svg>';
}
const byYear=new Map(labour.rows.map(row=>[row.year,row]));
let current=[];
function render(){
 const from=Number($('renewal-from').value),to=Number($('renewal-to').value);
 const demKey=$('renewal-demo').value,labKey=$('renewal-labour').value;
 const msg=$('renewal-message');
 if(from>to){
  msg.textContent='Seleziona un anno iniziale precedente o uguale a quello finale.';
  $('renewal-kpis').replaceChildren();$('renewal-demo-chart').replaceChildren();
  $('renewal-labour-chart').replaceChildren();$('renewal-interpretation').replaceChildren();
  $('renewal-table').querySelector('tbody').replaceChildren();current=[];
  return;
 }
 msg.textContent='';
 current=demography.rows.filter(row=>row.year>=from&&row.year<=to)
  .filter(row=>byYear.has(row.year))
  .map(row=>({...row,labour:byYear.get(row.year)}));
 if(!current.length){msg.textContent='Nessun dato comune per il periodo selezionato.';return;}
 const a=definitions[demKey],b=definitions[labKey];
 const first=current[0],last=current.at(-1);
 const deltaDemo=last[demKey]-first[demKey],deltaLab=last.labour[labKey]-first.labour[labKey];
 $('renewal-demo-title').textContent=a.label+' · valori assoluti';
 $('renewal-labour-title').textContent=b.label+' · tassi annuali';
 $('renewal-demo-chart').innerHTML=line(current,demKey,'#087c76',a.label,a.digits);
 $('renewal-labour-chart').innerHTML=line(current.map(r=>({year:r.year,[labKey]:r.labour[labKey]})),labKey,'#7a5cff',b.label,b.digits);
 const card=(label,value,sub)=>'<div class="card"><div class="metric-label">'+label+'</div><div class="metric-value">'+value+'</div><div class="metric-sub">'+sub+'</div></div>';
 $('renewal-kpis').innerHTML=
   card(a.label+' · '+to,format(last[demKey],a.digits),a.unit)+
   card('Variazione demografica',signed(deltaDemo,a.digits),a.unit+' · '+from+'–'+to)+
   card(b.label+' · '+to,format(last.labour[labKey],b.digits)+'%',b.unit)+
   card('Variazione tasso',signed(deltaLab,1)+' p.p.','Punti percentuali · '+from+'–'+to);
 $('renewal-interpretation').textContent='Nel periodo '+from+'–'+to+', '+a.label.toLowerCase()+' varia di '+signed(deltaDemo,a.digits)+' '+a.unit+', mentre '+b.label.toLowerCase()+' cambia di '+signed(deltaLab,1)+' punti percentuali. Il confronto descrive due andamenti simultanei, senza misurarne il nesso causale. Per stimare il ricambio effettivo servirebbero dati per età sui lavoratori, entrate e uscite per professione e pensionamenti.';
 $('renewal-table').querySelector('thead').innerHTML='<tr><th>Anno</th><th>'+a.label+' ('+a.unit+')</th><th>'+b.label+' (%)</th></tr>';
 $('renewal-table').querySelector('tbody').innerHTML=current.map(r=>'<tr><td>'+r.year+'</td><td>'+format(r[demKey],a.digits)+'</td><td>'+format(r.labour[labKey],1)+'</td></tr>').join('');
}
function exportCsv(){
 if(!current.length)return;
 const dk=$('renewal-demo').value,lk=$('renewal-labour').value;
 const lines=['anno;'+dk+';'+lk,...current.map(r=>[r.year,r[dk],r.labour[lk]].map(x=>String(x).replace('.',',')).join(';'))];
 const metadata=['# Popolazione ISTAT al 1 gennaio; tassi ISTAT media annuale','# Fonte demografia: '+demography.source.url,'# Fonte lavoro: Camera di commercio di Bergamo, Forze di lavoro 2025; valori da verificare puntualmente','# Confronto descrittivo, non previsione'];
 const blob=new Blob(['\ufeff'+metadata.join('\r\n')+'\r\n'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='bergamo_ricambio_'+current[0].year+'_'+current.at(-1).year+'.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
['renewal-from','renewal-to','renewal-demo','renewal-labour'].forEach(id=>$(id).addEventListener('change',render));
$('renewal-export').addEventListener('click',exportCsv);
render();
})();