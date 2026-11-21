/* Motion, command navigation and browser-local appearance preferences. */
(function(){
'use strict';
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const lightweight=()=>!smoothMotion||reduced()||window.innerWidth<=900||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
const styles={coral:{label:'Corail',rgb:'224 103 91',deep:'130 69 58',tint:'240 212 191'},sage:{label:'Sauge',rgb:'69 151 130',deep:'42 90 80',tint:'191 219 198'},iris:{label:'Iris',rgb:'130 112 189',deep:'73 63 110',tint:'211 205 232'},night:{label:'Nuit',rgb:'67 97 123',deep:'34 48 62',tint:'185 201 210'}};
let theme='coral',smoothMotion=false,activeIndex=0,lastFocus=null;
try{const saved=JSON.parse(localStorage.getItem('soonre-appearance-v1')||'null');if(saved&&Object.hasOwn(styles,saved.theme)){theme=saved.theme;smoothMotion=saved.smoothMotion===true;}}catch{}
function applyTheme(name,persist=true){
 if(!Object.hasOwn(styles,name))return;
 theme=name;const value=styles[name],root=document.documentElement;root.dataset.workspaceTheme=name;root.style.setProperty('--experience-accent',value.rgb);root.style.setProperty('--experience-deep',value.deep);root.style.setProperty('--experience-tint',value.tint);
 document.querySelectorAll('[data-experience-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.experienceTheme===name)));
 if(persist)try{localStorage.setItem('soonre-appearance-v1',JSON.stringify({theme:name,smoothMotion}));}catch{toast('Préférence appliquée pour cette session uniquement','warning');}
 if(window.Chart?.getChart){for(const canvas of document.querySelectorAll('canvas')){const chart=Chart.getChart(canvas);if(!chart?.data||chart.config.type!=='line'||!canvas.closest('.page')?.classList.contains('active'))continue;for(const dataset of chart.data.datasets)if(chart.config.type==='line'){dataset.borderColor='rgb('+value.rgb+')';dataset.backgroundColor='rgb('+value.rgb+' / .14)';dataset.pointBackgroundColor='rgb('+value.rgb+')';}chart.update(lightweight()?'none':undefined);}}
}
applyTheme(theme,false);
function palette(){
 if(!db.currentUser?.actif)return;
 lastFocus=document.activeElement;
 openModal('Aller à…','<div class="experience-search"><label for="experienceQuery">Rechercher une page ou une action</label><input id="experienceQuery" class="form-control" autocomplete="off" placeholder="Réservations, chambres, nouvelle réservation…" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="experienceResults"><div id="experienceResults" role="listbox" aria-label="Résultats"></div><p class="experience-search-help">↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer</p></div>','');
 document.getElementById('modalBox').classList.add('experience-command');
 const input=document.getElementById('experienceQuery'),box=document.getElementById('experienceResults');
 const items=[...document.querySelectorAll('.nav-item')].filter(n=>n.style.display!=='none').map(n=>({label:n.textContent.trim(),page:n.dataset.page,run:()=>showPage(n.dataset.page)}));
 if(['Super Administrateur','Directeur Général','Gérant','Accueil / Réception'].includes(db.currentUser.role))items.unshift({label:'Nouvelle réservation',page:'reservations',run:()=>openResaModal()});
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let visible=[];
 function select(index){activeIndex=Math.max(0,Math.min(index,visible.length-1));[...box.children].forEach((node,i)=>node.setAttribute('aria-selected',String(i===activeIndex)));input.setAttribute('aria-activedescendant',visible.length?'experienceResult'+activeIndex:'');}
 function activate(item){closeModal();document.getElementById('modalBox').classList.remove('experience-command');item.run();}
 function render(){const q=normalize(input.value);visible=items.filter(item=>normalize(item.label).includes(q)).slice(0,9);box.replaceChildren();for(const [i,item] of visible.entries()){const b=document.createElement('button');b.type='button';b.id='experienceResult'+i;b.setAttribute('role','option');b.className='experience-result';const label=document.createElement('span');label.textContent=item.label;const detail=document.createElement('small');detail.textContent='Ouvrir ↗';b.append(label,detail);b.onclick=()=>activate(item);box.append(b);}if(!visible.length){const p=document.createElement('p');p.textContent='Aucune page accessible ne correspond.';p.className='experience-no-result';box.append(p);}select(0);}
 input.oninput=render;input.onkeydown=e=>{if(['ArrowDown','ArrowUp','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Enter'){if(visible[activeIndex])activate(visible[activeIndex]);}else select(activeIndex+(e.key==='ArrowDown'?1:-1));}};render();input.focus();
}
const searchButton=document.createElement('button');searchButton.type='button';searchButton.className='experience-search-button';searchButton.setAttribute('aria-label','Rechercher une page — Ctrl ou Commande K');const searchLabel=document.createElement('span');searchLabel.textContent='Rechercher…';const shortcut=document.createElement('kbd');shortcut.textContent='Ctrl K';searchButton.append(searchLabel,shortcut);searchButton.onclick=palette;document.querySelector('.topbar-right')?.prepend(searchButton);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&db.currentUser?.actif){e.preventDefault();palette();}});
const closeOriginal=closeModal;closeModal=function(){document.getElementById('modalBox')?.classList.remove('experience-command');return closeOriginal.apply(this,arguments);};
const appearanceTab=document.createElement('button');appearanceTab.type='button';appearanceTab.className='tab';appearanceTab.dataset.partab='appearance';appearanceTab.textContent='Apparence';appearanceTab.onclick=()=>switchParamTab('appearance');document.querySelector('#page-parametres>.tabs')?.append(appearanceTab);
const panel=document.createElement('section');panel.id='param-appearance';panel.style.display='none';panel.className='card experience-settings';
const heading=document.createElement('h3');heading.textContent='Un espace à votre image';const help=document.createElement('p');help.textContent='Choisissez l’ambiance de ce navigateur. Cette préférence ne change pas les données de l’hôtel.';const choices=document.createElement('div');choices.className='experience-themes';
for(const [key,style] of Object.entries(styles)){const b=document.createElement('button');b.type='button';b.dataset.experienceTheme=key;b.style.setProperty('--swatch',style.rgb);b.setAttribute('aria-pressed',String(theme===key));const swatch=document.createElement('span');swatch.className='experience-swatch';swatch.setAttribute('aria-hidden','true');const name=document.createElement('strong');name.textContent=style.label;b.append(swatch,name);b.onclick=()=>applyTheme(key);choices.append(b);}
const motionNote=document.createElement('p');motionNote.textContent='Les transitions sont désactivées par défaut pour privilégier la rapidité. Le réglage « Réduire les animations » de votre appareil reste prioritaire.';const motionLabel=document.createElement('label');motionLabel.className='experience-motion-option';const motionInput=document.createElement('input');motionInput.type='checkbox';motionInput.id='experienceMotion';motionInput.checked=smoothMotion;motionInput.onchange=()=>{smoothMotion=motionInput.checked;applyTheme(theme);};motionLabel.append(motionInput,document.createTextNode('Transitions douces sur ordinateur'));panel.append(heading,help,choices,motionLabel,motionNote);document.getElementById('page-parametres').append(panel);
const originalParam=switchParamTab;switchParamTab=function(name){const result=originalParam.apply(this,arguments);for(const area of document.querySelectorAll('#page-parametres>[id^="param-"]'))area.style.display=area.id==='param-'+name?'':'none';return result;};
let lastAnimatedPage=null;
function cascade(name){if(lastAnimatedPage===name)return;lastAnimatedPage=name;if(lightweight()||typeof Element.prototype.animate!=='function')return;const page=document.getElementById('page-'+name);if(!page?.classList.contains('active'))return;const nodes=[...page.children].filter(n=>n.style.display!=='none').slice(0,4);for(const [i,node]of nodes.entries())node.animate([{opacity:.75,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:160,delay:i*15,easing:'ease-out'});}

const originalPage=showPage;showPage=function(name){const result=originalPage.apply(this,arguments);cascade(name);return result;};
const originalApp=showApp;let openedFor=null;
showApp=function(){const result=originalApp.apply(this,arguments);if(openedFor!==db.currentUser?.id&&!lightweight()&&typeof Element.prototype.animate==='function'){openedFor=db.currentUser?.id;document.querySelector('#app .main')?.animate([{opacity:.65},{opacity:1}],{duration:180,easing:'ease-out'});}return result;};
// Retain actual chart values; only the transition and accent follow appearance settings.
if(window.Chart?.register){Chart.defaults.devicePixelRatio=Math.min(window.devicePixelRatio||1,1.25);Chart.defaults.animation=false;Chart.register({id:'soonreExperienceAccent',beforeUpdate(chart){if(chart.config.type==='line'){const rgb=styles[theme].rgb;for(const ds of chart.data.datasets){ds.borderColor='rgb('+rgb+')';ds.backgroundColor='rgb('+rgb+' / .14)';ds.pointBackgroundColor='rgb('+rgb+')';}}chart.options.animation=lightweight()?false:{duration:180,easing:'easeOutQuad'};}});}
// Reuse the dashboard charts; unchanged data needs no canvas redraw.
const sameNumbers=(a,b)=>a?.length===b.length&&a.every((x,i)=>Number(x)===Number(b[i]));
const originalOccup=renderOccupChart;
renderOccupChart=function(){
 const chart=occupChart,rows=document.querySelectorAll('#occupStats .stat-row .value');
 if(!chart?.data?.datasets?.[0]||!chart.update||rows.length!==4)return originalOccup.apply(this,arguments);
 const counts={libre:0,occupee:0,reservee:0,maintenance:0};for(const c of db.chambres)if(Object.hasOwn(counts,c.statut))counts[c.statut]++;
 const values=Object.values(counts);if(!sameNumbers(chart.data.datasets[0].data,values)){chart.data.datasets[0].data=values;chart.update(lightweight()?'none':undefined);}rows.forEach((node,i)=>{if(node.textContent!==String(values[i]))node.textContent=values[i];});
};
const originalRepart=renderRepartChart;
renderRepartChart=function(){
 const chart=repartChart;if(!chart?.data?.datasets?.[0]||!chart.update)return originalRepart.apply(this,arguments);
 const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),1),cats={hebergement:0,restauration:0,salle:0,mixte:0};
 for(const f of db.factures)if(new Date(f.date)>=start)cats[f.type]=(cats[f.type]||0)+(f.paye||0);
 const values=[cats.hebergement,cats.restauration,cats.salle,cats.mixte];if(!sameNumbers(chart.data.datasets[0].data,values)){chart.data.datasets[0].data=values;chart.update(lightweight()?'none':undefined);}
};
window.SOONRE_EXPERIENCE={openSearch:palette,setTheme:name=>applyTheme(name),getTheme:()=>theme};
})();
