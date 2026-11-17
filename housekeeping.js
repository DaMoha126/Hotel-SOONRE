/* Hotel SOONRE — housekeeping interface. State changes are server operations. */
(function(){
'use strict';
const labels={a_verifier:'À vérifier',a_nettoyer:'À nettoyer',en_cours:'Nettoyage en cours',propre:'Propre'};
const roomLabels={libre:'Libre',occupee:'Occupée',reservee:'Réservée',maintenance:'Maintenance'};
const editors=['Super Administrateur','Directeur Général','Gérant','Ménage'];
const operators=['Super Administrateur','Directeur Général','Gérant','Accueil / Réception'];
const knownHotels=new Set(),busyRooms=new Set(),busyBookings=new Set();
let expanded=false,lastOwner=null;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const active=()=>db.currentUser?.actif===true;
const mayEdit=()=>active()&&editors.includes(db.currentUser.role);
const capability=()=>window.SOONRE_CAPABILITIES?.housekeeping===true||knownHotels.has(db.hotelId);
const versionFor=(table,id)=>baselineVersions.get(table+':'+id);
const validVersion=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function action(text,fn,disabled){const b=el('button',text,'btn btn-sm btn-ghost');b.type='button';b.disabled=!!disabled;b.onclick=fn;return b;}
function caption(room){
 if(!capability())return 'Suivi ménage non activé sur le serveur';
 if(!own(room,'etatMenage'))return 'État à actualiser';
 return labels[room.etatMenage]||'État ménage non reconnu';
}
const originalFrom=chambreFromDb,originalTo=chambreToDb;
chambreFromDb=function(row){
 const room=originalFrom(row);
 if(own(row,'etat_menage')){
  room.etatMenage=own(labels,row.etat_menage)?row.etat_menage:null;
  if(row.hotel_id||db.hotelId)knownHotels.add(row.hotel_id||db.hotelId);
 }
 return room;
};
// Never send cleanliness through generic collection synchronization.
chambreToDb=function(room){const row=originalTo(room);delete row.etat_menage;return row;};
const coreRoom=CORE.find(x=>x[0]==='chambres');
if(coreRoom){coreRoom[2]=chambreToDb;coreRoom[3]=chambreFromDb;}
function mount(){
 const page=document.getElementById('page-chambres');if(!page)return null;
 let panel=document.getElementById('housekeepingPanel');if(panel)return panel;
 panel=el('section',undefined,'card');panel.id='housekeepingPanel';panel.setAttribute('aria-label','Ménage des chambres');
 const header=el('div');Object.assign(header.style,{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'});
 header.append(el('h3','Ménage des chambres'));
 const toggle=action('Afficher le ménage',()=>{expanded=!expanded;render();});toggle.id='housekeepingToggle';toggle.setAttribute('aria-controls','housekeepingBody');header.append(toggle);
 panel.append(header);
 const message=el('p');message.id='housekeepingMessage';message.style.margin='12px 0';panel.append(message);
 const body=el('div');body.id='housekeepingBody';
 const controls=el('div');Object.assign(controls.style,{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'14px'});
 const filterGroup=el('div',undefined,'form-group');const filterLabel=el('label','État du ménage');filterLabel.htmlFor='housekeepingFilter';
 const filter=el('select',undefined,'form-control');filter.id='housekeepingFilter';
 for(const [key,label]of Object.entries({'':'Tous les états',...labels})){const option=el('option',label);option.value=key;filter.append(option);}
 filter.onchange=renderCards;filterGroup.append(filterLabel,filter);
 const searchGroup=el('div',undefined,'form-group');const searchLabel=el('label','Rechercher une chambre');searchLabel.htmlFor='housekeepingSearch';
 const search=el('input',undefined,'form-control');search.id='housekeepingSearch';search.type='search';search.placeholder='Numéro de chambre';search.oninput=renderCards;
 searchGroup.append(searchLabel,search);controls.append(filterGroup,searchGroup);
 const live=el('div');live.id='housekeepingFeedback';live.setAttribute('role','status');live.setAttribute('aria-live','polite');
 const grid=el('div');grid.id='housekeepingGrid';Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:'12px'});
 body.append(controls,live,grid);panel.append(body);
 const anchor=document.getElementById('roomsGridView');if(anchor)anchor.before(panel);else page.append(panel);
 return panel;
}
function renderCards(){
 const grid=document.getElementById('housekeepingGrid');if(!grid)return;
 grid.replaceChildren();
 const filter=document.getElementById('housekeepingFilter')?.value||'';
 const term=(document.getElementById('housekeepingSearch')?.value||'').trim().toLocaleLowerCase('fr');
 const rooms=(db.chambres||[]).filter(c=>(!filter||c.etatMenage===filter)&&(!term||String(c.numero||'').toLocaleLowerCase('fr').includes(term)))
  .slice().sort((a,b)=>String(a.numero||'').localeCompare(String(b.numero||''),'fr',{numeric:true}));
 if(!rooms.length){grid.append(el('p','Aucune chambre correspondant aux filtres.'));return;}
 for(const room of rooms){
  const card=el('article',undefined,'card');Object.assign(card.style,{margin:'0',padding:'14px',overflowWrap:'anywhere'});
  const title=el('h4','Chambre '+String(room.numero||'—'));card.append(title);
  card.append(el('p','Disponibilité : '+(roomLabels[room.statut]||room.statut||'Non renseignée')));
  const state=el('p','Ménage : '+caption(room));state.style.fontWeight='700';card.append(state);
  if(room.statut==='maintenance')card.append(el('p','La propreté ne lève pas la maintenance.','text-muted'));
  const buttons=el('div');Object.assign(buttons.style,{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'12px'});
  buttons.append(action('Voir la chambre',()=>viewRoom(room.id),false));
  const waiting=busyRooms.has(db.hotelId+':'+room.id);
  card.setAttribute('aria-busy',String(waiting));
  if(mayEdit()){
   const ready=capability()&&own(room,'etatMenage')&&validVersion(versionFor('chambres',room.id))&&cloudReady&&!recoveryBlocked&&!waiting;
   const candidates=room.etatMenage==='propre'?[['a_nettoyer','À nettoyer'],['a_verifier','À vérifier']]
    :room.etatMenage==='en_cours'?[['propre','Marquer propre'],['a_nettoyer','À nettoyer']]
    :[['en_cours','Commencer le ménage'],['propre','Marquer propre']];
   for(const [next,label]of candidates)buttons.append(action(waiting?'Mise à jour…':label,()=>setState(room.id,next),!ready));
  }
  card.append(buttons);grid.append(card);
 }
}
function render(){
 const panel=mount();if(!panel)return;
 panel.hidden=!active();if(!active())return;
 if(lastOwner!==db.hotelId){
  lastOwner=db.hotelId;
  document.getElementById('housekeepingFilter').value='';
  document.getElementById('housekeepingSearch').value='';
  if(['Ménage','Maintenance'].includes(db.currentUser.role))expanded=true;
 }
 const toggle=document.getElementById('housekeepingToggle');
 toggle.textContent=expanded?'Revenir à la disponibilité':'Afficher le ménage';
 toggle.setAttribute('aria-expanded',String(expanded));
 document.getElementById('housekeepingBody').hidden=!expanded;
 document.getElementById('housekeepingMessage').textContent=!capability()
  ?'Le suivi ménage n’est pas encore activé sur ce serveur. Aucun état affiché ne certifie la propreté.'
  :mayEdit()?'Après vérification sur place, enregistrez le nettoyage. Un départ remet la chambre à nettoyer.'
   :'Les états sont visibles ici. La validation du ménage est réservée au personnel autorisé.';
 const gridView=document.getElementById('roomsGridView'),tableView=document.getElementById('roomsTableView');
 if(gridView)gridView.style.display=!expanded&&roomView==='grid'?'block':'none';
 if(tableView)tableView.style.display=!expanded&&roomView==='table'?'block':'none';
 const filters=document.querySelector('#page-chambres > .filters');
 if(filters){if(!own(filters.dataset,'housekeepingDisplay'))filters.dataset.housekeepingDisplay=filters.style.display;filters.style.display=expanded?'none':filters.dataset.housekeepingDisplay;}
 renderCards();
}
const originalRender=renderRooms;
renderRooms=function(){const result=originalRender.apply(this,arguments);render();return result;};
const originalView=viewRoom;
viewRoom=function(id){
 const room=db.chambres.find(c=>c.id===id);if(!room)return;
 originalView.apply(this,arguments);
 const block=el('div');block.style.marginTop='14px';block.append(el('h5','MÉNAGE'),el('p',caption(room)));
 document.getElementById('modalBody')?.append(block);
 if(!isManager())document.querySelectorAll('#modalFooter button[onclick^="editRoom("]').forEach(b=>b.remove());
};
function sameContext(owner,user){return db.hotelId===owner&&db.currentUser?.id===user&&active();}
async function setState(id,next){
 if(!mayEdit()){toast('Modification du ménage réservée au personnel autorisé','warning');return false;}
 if(!own(labels,next)){toast('État ménage invalide','warning');return false;}
 if(!capability()){toast('Le suivi ménage n’est pas activé sur le serveur','warning');return false;}
 if(!cloudReady||recoveryBlocked){toast('Connectez-vous et récupérez les sauvegardes en attente','warning');return false;}
 const owner=db.hotelId,user=db.currentUser.id,key=owner+':'+id;
 if(busyRooms.has(key))return false;busyRooms.add(key);render();
 try{
  await queueCloudSync();
  if(!sameContext(owner,user)||window.hotelSyncPending||recoveryBlocked)return false;
  const room=db.chambres.find(c=>c.id===id),version=versionFor('chambres',id);
  if(!room||!own(room,'etatMenage')||!validVersion(version)){toast('Actualisez les chambres avant de modifier le ménage','warning');return false;}
  const result=await callServerRPC('changer_etat_menage',{p_id:id,p_etat:next,p_version:version});
  if(result.error){toast('Ménage non confirmé : '+result.error.message,'danger');return false;}
  const row=Array.isArray(result.data)?result.data[0]:result.data;
  if(!row||row.id!==id||!own(labels,row.etat_menage)||!validVersion(row.version))throw new Error('Réponse serveur incomplète. Actualisez les données.');
  if(!sameContext(owner,user))return true;
  room.etatMenage=row.etat_menage;
  // Never advance the business baseline for unrelated edits made while the RPC ran.
  if(!window.hotelSyncPending&&versionFor('chambres',id)===version)baselineVersions.set('chambres:'+id,row.version);
  persistLocal();
  toast('Ménage confirmé : '+labels[row.etat_menage]);
  return true;
 }catch(error){toast('Ménage non confirmé : '+error.message,'danger');return false;}
 finally{busyRooms.delete(key);if(sameContext(owner,user))renderRooms();}
}
async function transition(id,next){
 if(!active()||!operators.includes(db.currentUser.role)){toast('Action réservée à la réception et à la direction','warning');return false;}
 if(!cloudReady||recoveryBlocked){toast('Connectez-vous et récupérez les sauvegardes en attente','warning');return false;}
 const owner=db.hotelId,user=db.currentUser.id,key=owner+':'+id;
 if(busyBookings.has(key))return false;
 const booking=db.reservations.find(r=>r.id===id);
 if(!booking||booking.statut!==(next==='checkin'?'confirmee':'checkin'))return false;
 const room=db.chambres.find(c=>c.id===booking.chambreId);
 if(next==='checkin'){
  if(!room||room.statut==='maintenance'){toast('Chambre indisponible : vérifiez la maintenance','warning');return false;}
  if(room.etatMenage!=='propre'){toast('Vérifiez et validez le ménage avant le Check-in','warning');return false;}
  if(db.reservations.some(r=>r.id!==id&&r.chambreId===booking.chambreId&&r.statut==='checkin')){toast('Chambre déjà occupée','warning');return false;}
 }
 busyBookings.add(key);
 try{
  await queueCloudSync();
  if(!sameContext(owner,user)||window.hotelSyncPending||recoveryBlocked)return false;
  const version=versionFor('reservations',id);
  if(!validVersion(version)){toast('Actualisez les réservations avant de continuer','warning');return false;}
  const result=await callServerRPC('changer_statut_reservation',{p_id:id,p_statut:next,p_version:version});
  if(result.error){toast('Mouvement non confirmé : '+result.error.message,'danger');return false;}
  if(result.data==null)throw new Error('Réponse serveur incomplète. Actualisez les données.');
  if(!sameContext(owner,user))return true;
  try{await loadCloudState();renderReservations();renderRooms();renderDashboard();}
  catch(error){toast('Mouvement confirmé sur le serveur. Actualisez les données avant de continuer : '+error.message,'warning');return true;}
  toast(next==='checkin'?'Check-in confirmé':'Check-out confirmé. Chambre à nettoyer.');
  return true;
 }catch(error){toast('Mouvement non confirmé : '+error.message,'danger');return false;}
 finally{busyBookings.delete(key);}
}
const originalCheckin=checkinResa,originalCheckout=checkoutResa;
checkinResa=function(id){
 if(!capability()){toast('Suivi ménage non activé : vérifiez la chambre sur place','warning');return originalCheckin.apply(this,arguments);}
 return transition(id,'checkin');
};
checkoutResa=function(id){
 if(!capability()){toast('Suivi ménage non activé : transmettez le départ au personnel de ménage','warning');return originalCheckout.apply(this,arguments);}
 return transition(id,'checkout');
};
const originalSaveResa=saveResa;
saveResa=function(event,id){const r=db.reservations.find(x=>x.id===id);if(capability()&&r?.statut==='checkin'&&document.getElementById('rChambre')?.value!==r.chambreId){event.preventDefault();toast('Enregistrez le départ avant de changer de chambre','warning');return;}return originalSaveResa.apply(this,arguments);};
window.SOONRE_HOUSEKEEPING={render,isAvailable:capability,canEdit:mayEdit,setState,isBusy:()=>busyRooms.size>0||busyBookings.size>0};
})();
