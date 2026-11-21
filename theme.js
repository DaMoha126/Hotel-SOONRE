/* Presentation only. No business data, permissions or persistence changes. */
(function(){
'use strict';
const paths={dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',reservations:'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16 M8 15h2 M14 15h2',chambres:'M3 18V7 M21 18V9 M3 14h18 M3 9h6v5 M9 9h12',clients:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M22 21v-3a4 4 0 0 0-3-4',restauration:'M4 3v7a3 3 0 0 0 6 0V3 M7 3v18 M20 21V3c-5 2-5 10 0 10',salles:'M3 21h18 M5 21V5h14v16 M9 9h1 M14 9h1 M9 13h1 M14 13h1 M10 21v-4h4v4',magasins:'M3 10l2-7h14l2 7 M3 10h18 M5 10v11h14V10 M9 21v-6h6v6',stock:'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',factures:'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',caisse:'M3 6h18v14H3z M3 10h18 M15 15h3 M7 3h10',depenses:'M4 4v16h16 M8 8l4 4 4-2 4 5',comptabilite:'M4 3h16v18H4z M8 7h8 M8 11h2 M14 11h2 M8 15h2 M14 15h2',personnel:'M8 3h8v5H8z M4 6h16v15H4z M9 12h6 M9 16h6',pointage:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',paie:'M3 5h18v15H3z M3 9h18 M7 15h3',audit:'M9 3h6v4H9z M9 5H5v16h14V5h-4 M9 12h6 M9 16h4',parametres:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6L7 7 M17 17l1.4 1.4 M5.6 18.4L7 17 M17 7l1.4-1.4'};
function icon(path){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','soonre-icon');svg.setAttribute('aria-hidden','true');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',path);svg.append(p);return svg;}
for(const item of document.querySelectorAll('.nav-item')){
 const holder=item.querySelector('.icon');if(holder&&paths[item.dataset.page])holder.replaceChildren(icon(paths[item.dataset.page]));
 item.setAttribute('role','button');item.tabIndex=0;item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();item.click();}});
}
const stats=['caisse','chambres','reservations','clients'];document.querySelectorAll('#page-dashboard>.kpi-grid .icon-box').forEach((holder,i)=>{if(paths[stats[i]])holder.replaceChildren(icon(paths[stats[i]]));});
const page=document.getElementById('page-dashboard');
if(page){
 const welcome=document.createElement('section');welcome.className='soonre-welcome';welcome.setAttribute('aria-label','Actions rapides');
 const intro=document.createElement('div'),eyebrow=document.createElement('span'),title=document.createElement('h2'),subtitle=document.createElement('p');
 eyebrow.className='soonre-eyebrow';eyebrow.textContent='Votre espace de gestion';title.textContent='Une belle journée commence ici.';subtitle.textContent='Les séjours, les chambres et l’activité de votre hôtel, en un regard.';intro.append(eyebrow,title,subtitle);
 const actions=document.createElement('div');actions.className='soonre-actions';
 for(const [label,run,primary] of [['Voir les chambres',()=>showPage('chambres'),false],['Nouvelle réservation',()=>openResaModal(),true]]){const b=document.createElement('button');b.type='button';b.className='btn '+(primary?'btn-primary':'btn-ghost');b.textContent=label;b.onclick=run;actions.append(b);}
 welcome.append(intro,actions);page.prepend(welcome);
}
if(window.Chart?.register){
 Chart.defaults.font.family="'Manrope', system-ui, sans-serif";Chart.defaults.color='#89796d';
 Chart.register({id:'soonreWarmPalette',beforeUpdate(chart){const palette=['#c57661','#719382','#c7ab7c','#8d899f','#a0786b'];for(const [i,dataset] of chart.data.datasets.entries()){
  if(['doughnut','pie','polarArea'].includes(chart.config.type)){dataset.backgroundColor=chart.canvas.id==='occupChart'?['#719382','#c57661','#8d899f','#c7ab7c']:palette;dataset.borderWidth=4;dataset.borderColor='#fffdfa';dataset.hoverOffset=4;}
  else{dataset.borderColor=palette[i%palette.length];dataset.backgroundColor=chart.config.type==='line'?'rgba(197,118,97,.12)':palette[i%palette.length];dataset.pointBackgroundColor=palette[i%palette.length];dataset.pointRadius=2;dataset.borderWidth=2;}
 }if(chart.options.scales)for(const scale of Object.values(chart.options.scales)){if(scale.grid)scale.grid.color='#eee6dd';}chart.options.animation=window.matchMedia('(prefers-reduced-motion: reduce)').matches?false:{duration:450};}});
}
})();
