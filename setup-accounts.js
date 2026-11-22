/* Guided hotel setup and hotel-scoped staff management. */
(function(){
 'use strict';
 const state={people:new Map(),backups:new Map(),peoplePending:new Map(),backupPending:new Map(),userGeneration:0};
 const allowed=()=>db.currentUser?.actif===true&&['Super Administrateur','Directeur Général','Gérant'].includes(db.currentUser.role);
 const sameHotel=owner=>allowed()&&db.hotelId===owner;
 const text=value=>String(value??'');
 const hotelName=()=>text(db.config?.nom).trim()||'Hôtel actif';
 const roleHelp={
  'Super Administrateur':'Gestion de plusieurs hôtels et de leurs responsables.',
  'Directeur Général':'Configuration, comptes de niveau inférieur, finances et suivi de cet hôtel.',
  'Gérant':'Gestion opérationnelle, finances et comptes de réception, ménage et maintenance de cet hôtel.',
  'Accueil / Réception':'Clients, réservations, factures et encaissements autorisés ; aucun changement de rôle ou de tarif.',
  'Ménage':'Suivi du nettoyage et de la propreté des chambres, messagerie de l’équipe ; aucun encaissement ni changement de tarif.',
  'Maintenance':'Suivi des indisponibilités des chambres et messagerie de l’équipe ; aucun encaissement ni changement de tarif.'
 };
 function element(tag,className,value){
  const el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=value;return el;
 }
 function formatTime(value){
  const date=new Date(value);return Number.isFinite(date.getTime())?date.toLocaleString('fr-FR'):'date non disponible';
 }
 function reportError(message){toast(message,'warning');}
 function goTo(page,tab){
  closeModal();showPage(page);if(tab&&typeof switchParamTab==='function')switchParamTab(tab);
 }
 function openBackups(){
  closeModal();
  if(typeof window.openHotelBackupPanel==='function')window.openHotelBackupPanel();
  else goTo('parametres','data');
 }
 async function getPeople(owner,force=false){
  if(!sameHotel(owner))return null;
  const old=state.people.get(owner);
  if(!force&&old&&Date.now()-old.at<45000)return old;
  if(state.peoplePending.has(owner))return state.peoplePending.get(owner);
  const job=(async()=>{
   try{
    let people=[];
    for(let start=0;;start+=500){
     const result=await safeQuery(sb.from('profiles').select('id,role,actif').eq('hotel_id',owner).order('id').range(start,start+499));
     if(result.error)throw new Error(result.error.message||'Chargement impossible');
     if(!Array.isArray(result.data))throw new Error('Réponse du serveur incomplète');
     people.push(...result.data);if(result.data.length<500)break;
    }
    if(!sameHotel(owner))return null;
    const entry={at:Date.now(),count:people.filter(p=>p.actif===true&&p.role!=='Super Administrateur').length,error:false};
    state.people.set(owner,entry);return entry;
   }catch{
    if(!sameHotel(owner))return null;
    const entry={at:Date.now(),count:0,error:true};state.people.set(owner,entry);return entry;
   }finally{state.peoplePending.delete(owner);}
   if(allowed()&&db.hotelId)renderSetupCard();
})();state.peoplePending.set(owner,job);return job;
 }
 async function getBackup(owner,force=false){
  if(!sameHotel(owner))return null;
  const old=state.backups.get(owner);
  if(!force&&old&&Date.now()-old.at<45000)return old;
  if(state.backupPending.has(owner))return state.backupPending.get(owner);
  const job=(async()=>{
   try{
    await Promise.resolve();
    const meta=typeof window.getHotelBackupStatus==='function'?await window.getHotelBackupStatus():null;
    if(!sameHotel(owner))return null;
    const entry={at:Date.now(),meta:meta&&typeof meta==='object'?meta:null};state.backups.set(owner,entry);return entry;
   }catch{
    if(sameHotel(owner))state.backups.set(owner,{at:Date.now(),meta:null});
    return null;
   }finally{state.backupPending.delete(owner);}
  })();state.backupPending.set(owner,job);return job;
 }
 function getSteps(){
  const config=db.config||{},rooms=db.chambres||[],people=state.people.get(db.hotelId),backup=state.backups.get(db.hotelId)?.meta;
  const identity=!![config.nom,config.adresse,config.ville,config.tel].every(v=>text(v).trim())&&Number.isFinite(Number(config.tva))&&Number(config.tva)>=0&&Number(config.tva)<=100;
  const validRooms=rooms.length>0&&rooms.every(r=>text(r.numero).trim()&&Number.isFinite(Number(r.prix))&&Number(r.prix)>=0&&Number(r.capacite)>0);
  const last=backup?.lastSuccessfulAt?new Date(backup.lastSuccessfulAt).getTime():NaN;
  const confirmed=cloudReady&&!window.hotelSyncPending&&!recoveryBlocked;
  const recent=Number.isFinite(last)&&last<=Date.now()+300000&&Date.now()-last<48*60*60*1000;
  return [
   {id:'identity',title:'Coordonnées et taux',done:identity&&confirmed,status:identity?(confirmed?'Coordonnées renseignées':'Sauvegarde à confirmer'):'À compléter',description:'Renseigner le nom, l’adresse, la ville et le téléphone ; vérifier les mentions et taux applicables avec la direction.',action:'Ouvrir les paramètres',run:()=>goTo('parametres','general')},
   {id:'rooms',title:'Chambres et tarifs',done:validRooms&&confirmed,status:validRooms?(confirmed?rooms.length+' chambre(s) renseignée(s)':'Sauvegarde à confirmer'):'À compléter',description:'Créer les vraies chambres, leurs capacités et leurs tarifs. Aucun tarif d’exemple ne valide la mise en service.',action:'Gérer les chambres',run:()=>goTo('chambres')},
   {id:'people',title:'Comptes du personnel',done:!!people&&!people.error&&people.count>0,status:!people?'Vérification…':people.error?'Vérification indisponible':people.count>0?people.count+' compte(s) actif(s)':'Aucun compte de personnel actif',description:'Prévoir un compte individuel par employé et attribuer seulement les droits nécessaires. Les mots de passe ne figurent pas dans les sauvegardes métier.',action:'Gérer les comptes',run:()=>goTo('parametres','users')},
   {id:'backup',title:'Sauvegardes et recette',done:!!backup?.scheduled&&recent,status:backup?.scheduled?(recent?'Sauvegarde programmée récente':'Sauvegarde récente à vérifier'):backup?.lastSuccessfulAt?'Sauvegarde ponctuelle — programmation à vérifier':'Programmation à vérifier',description:backup?.lastSuccessfulAt?'Dernière sauvegarde serveur : '+formatTime(backup.lastSuccessfulAt)+'. '+(backup.scheduleLabel||''):'Vérifier la sauvegarde serveur et sa restauration. Un téléchargement JSON local ne prouve pas qu’une sauvegarde automatique est active.',action:'Ouvrir les sauvegardes',run:openBackups}
  ];
 }
 function addEntryButton(){
  const panel=document.getElementById('param-general');if(!panel)return;
  let entry=document.getElementById('openSetupGuideButton');
  if(!allowed()){entry?.remove();return;}
  if(!entry){entry=element('button','btn btn-ghost','Continuer l’installation de cet hôtel');entry.id='openSetupGuideButton';entry.type='button';entry.style.marginBottom='12px';entry.onclick=openSetupGuide;panel.prepend(entry);}
 }
 function renderSetupCard(){
  const owner=db.hotelId;
  addEntryButton();
  let card=document.getElementById('setupStatus');
  if(!allowed()||!owner){card?.remove();return;}
  if(!card){card=element('div','card');card.id='setupStatus';document.getElementById('page-dashboard')?.prepend(card);}
  const steps=getSteps(),done=steps.filter(step=>step.done).length;
  card.replaceChildren();
  const heading=element('strong','',done===steps.length?'Configuration renseignée — recette réelle à effectuer':'Mise en service de '+hotelName());
  const progress=element('p','',done+' / '+steps.length+' étapes renseignées');
  progress.style.margin='8px 0';
  const list=element('ul');list.style.cssText='margin:0 0 12px;padding-left:20px';
  for(const step of steps)list.append(element('li','',step.title+' : '+step.status));
  const button=element('button','btn btn-primary','Continuer l’installation');button.type='button';button.onclick=openSetupGuide;
  card.append(heading,progress,list,button);
  const person=state.people.get(owner),backup=state.backups.get(owner);
  if(!person||Date.now()-person.at>45000)getPeople(owner).then(()=>{if(sameHotel(owner))renderSetupCard();});
  if(!backup||Date.now()-backup.at>45000)getBackup(owner).then(()=>{if(sameHotel(owner))renderSetupCard();});
 }
 function openSetupGuide(){
  if(!allowed()){reportError('Guide réservé à la direction de l’hôtel actif');return;}
  const owner=db.hotelId,steps=getSteps();
  const body=element('div');body.id='hotelSetupGuide';body.dataset.hotelId=owner;
  const context=element('p','');context.append(element('strong','',hotelName()),document.createTextNode(' — chaque étape concerne uniquement cet établissement.'));
  context.style.marginBottom='14px';body.append(context);
  for(let index=0;index<steps.length;index++){
   const step=steps[index],section=element('section','card');section.style.cssText='padding:14px;margin-bottom:10px';
   const title=element('h4','',(index+1)+'. '+step.title);
   const status=element('p','',step.status);status.id='setupGuideStatus-'+step.id;status.style.cssText='font-weight:700;margin:6px 0';
   const description=element('p','',step.description);description.id='setupGuideDescription-'+step.id;description.style.marginBottom='10px';
   const button=element('button','btn btn-ghost',step.action);button.type='button';button.dataset.setupAction=step.id;button.onclick=step.run;
   section.append(title,status,description,button);body.append(section);
  }
  const recipe=element('section','card');recipe.style.padding='14px';recipe.append(element('h4','','Recette à réaliser avec les vrais comptes du personnel'));
  const hint=element('p','','Cochez uniquement après réalisation. Cette liste locale aide la formation ; elle ne certifie aucun test serveur et n’est pas cochée automatiquement.');hint.style.margin='8px 0';recipe.append(hint);
  const checks=['Envoyer un message et une photo entre deux comptes de l’hôtel, puis vérifier les messages non lus.','Vérifier l’adresse de récupération et configurer la double authentification si souhaité.','Se connecter avec un compte de réception et vérifier ses droits.','Créer un séjour de test, enregistrer l’arrivée puis le départ.','Vérifier le passage de la chambre au ménage et son retour à l’état propre.','Facturer et tester les modes d’encaissement prévus sans utiliser de fonds réels.','Vérifier une sauvegarde et sa restauration sur une copie isolée.'];
  checks.forEach((label,index)=>{const line=element('label');line.style.cssText='display:flex;align-items:flex-start;gap:10px;margin:10px 0';const box=element('input');box.type='checkbox';box.id='setupRecipeCheck'+index;line.htmlFor=box.id;line.append(box,document.createTextNode(label));recipe.append(line);});
  body.append(recipe);
  openModal('Installation de '+hotelName(),'','<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>');
  document.getElementById('modalBody').replaceChildren(body);document.getElementById('modalBox').classList.add('lg');body.querySelector('button')?.focus();
  const refresh=async()=>{
   await Promise.allSettled([getPeople(owner,true),getBackup(owner,true)]);
   if(!sameHotel(owner))return;renderSetupCard();
   if(!body.isConnected)return;
   for(const step of getSteps()){const status=body.querySelector('#setupGuideStatus-'+step.id),description=body.querySelector('#setupGuideDescription-'+step.id);if(status)status.textContent=step.status;if(description)description.textContent=step.description;}
  };
  refresh();
 }
 async function renderHotelUsers(){
  const table=document.getElementById('usersTable');if(!table)return;
  const generation=++state.userGeneration,owner=db.hotelId;
  if(!allowed()){const row=element('tr'),notice=element('td','','Gestion des comptes réservée à la direction');notice.colSpan=5;row.append(notice);table.replaceChildren(row);return;}
  let context=document.getElementById('staffHotelContext');
  if(!context){context=element('div','card');context.id='staffHotelContext';context.style.cssText='padding:12px;margin-bottom:12px';document.getElementById('param-users')?.prepend(context);}
  context.replaceChildren(element('strong','','Comptes de '+hotelName()),element('p','','Chaque personne utilise son compte individuel. Les actions disponibles respectent la hiérarchie des rôles et les permissions du serveur.'));
  const loading=element('tr'),cell=element('td','','Chargement des comptes de cet hôtel…');cell.colSpan=5;loading.append(cell);table.replaceChildren(loading);
  try{
   let people=[];
   for(let start=0;;start+=500){
    const result=await safeQuery(sb.from('profiles').select('id,nom,email,role,actif').eq('hotel_id',owner).order('id').range(start,start+499));
    if(result.error)throw new Error(result.error.message||'Chargement impossible');
    if(!Array.isArray(result.data))throw new Error('Réponse du serveur incomplète');
    people.push(...result.data);if(result.data.length<500)break;
   }
   if(generation!==state.userGeneration||!sameHotel(owner))return;
   people.sort((a,b)=>text(a.nom).localeCompare(text(b.nom),'fr'));
   state.people.set(owner,{at:Date.now(),count:people.filter(p=>p.actif===true&&p.role!=='Super Administrateur').length,error:false});
   table.replaceChildren();
   if(!people.length){const row=element('tr'),empty=element('td','','Aucun compte pour cet hôtel');empty.colSpan=5;row.append(empty);table.append(row);}
   for(const person of people){
    const row=element('tr');row.append(element('td','',person.email?text(person.email).replace('@hotelsoonre.local',''):'—'),element('td','',person.nom||'—'));
    const role=element('td');role.append(element('span','badge badge-neutral',person.role||'—'));role.title=roleHelp[person.role]||'Droits définis par le serveur';row.append(role);
    const status=element('td');status.append(element('span','badge '+(person.actif?'badge-success':'badge-neutral'),person.actif?'Actif':'Inactif'));row.append(status);
    const actions=element('td');
    if(canManageProfile(person)){
     const edit=element('button','btn btn-sm btn-ghost','Modifier');edit.type='button';edit.onclick=()=>editUser(person.id);
     const reset=element('button','btn btn-sm btn-ghost','Réinitialiser le mot de passe');reset.type='button';reset.onclick=()=>reinitialiserMotDePasse(person.id,person.nom||'cet utilisateur');actions.append(edit,reset);
    }else actions.append(document.createTextNode(person.id===db.currentUser.id?'Votre compte : onglet Mon compte':'Gestion réservée à un niveau supérieur'));
    row.append(actions);table.append(row);
   }
   renderSetupCard();
  }catch{
   if(generation!==state.userGeneration||!sameHotel(owner))return;
   const row=element('tr'),error=element('td','','Impossible de charger les comptes. Vérifiez la connexion puis réessayez.');error.colSpan=5;row.append(error);table.replaceChildren(row);
  }
 }
 function addRoleExplanation(){
  const form=document.getElementById('usForm'),select=document.getElementById('usRole');if(!form||!select||!allowed())return;
  const context=element('p','','Compte individuel pour '+hotelName());context.style.cssText='font-weight:700;margin-bottom:12px';form.prepend(context);
  const help=element('p');help.id='staffRoleExplanation';help.style.cssText='font-size:13px;color:var(--muted);margin:8px 0';help.setAttribute('aria-live','polite');select.setAttribute('aria-describedby',help.id);
  const update=()=>help.textContent=roleHelp[select.value]||'Les permissions sont vérifiées par le serveur.';select.addEventListener('change',update);select.parentElement.append(help);update();
 }
 const originalOpenUser=window.openUserModal;
 window.openUserModal=function(...args){if(!allowed()){reportError('Gestion des comptes réservée à la direction');return;}const result=originalOpenUser.apply(this,args);addRoleExplanation();return result;};
 window.saveUser=async function(event){
  event.preventDefault();
  if(!allowed()){reportError('Gestion des comptes réservée à la direction');return;}
  const form=document.getElementById('usForm');if(!form||form.dataset.submitting==='true')return;
  const owner=db.hotelId,login=document.getElementById('usLogin').value.trim(),password=document.getElementById('usPass').value,nom=document.getElementById('usNom').value.trim(),role=document.getElementById('usRole').value;
  if(!login||password.length<8||!nom){reportError('Vérifiez les champs : identifiant, nom et mot de passe de 8 caractères minimum');return;}
  if(!cloudReady||recoveryBlocked){reportError('Une connexion serveur et la résolution des sauvegardes en attente sont nécessaires');return;}
  const buttons=[...document.querySelectorAll('#modalFooter button')];form.dataset.submitting='true';buttons.forEach(button=>button.disabled=true);
  try{
   const result=await sb.functions.invoke('create-user',{body:{login,password,nom,role,hotel_id:owner}});
   if(result.error){if(sameHotel(owner))reportError('Création non confirmée : '+(result.error.message||'vérifiez la connexion')+'. Consultez la liste avant une nouvelle tentative.');return;}
   state.people.delete(owner);
   if(form.isConnected&&sameHotel(owner)){form.reset();closeModal();}
   if(sameHotel(owner)){toast('Compte individuel créé pour cet hôtel');await renderHotelUsers();renderSetupCard();}
  }catch{
   if(sameHotel(owner))reportError('Création non confirmée. Vérifiez la liste des comptes avant de réessayer avec le même identifiant.');
  }finally{
   if(form.isConnected){form.dataset.submitting='false';buttons.forEach(button=>{if(button.isConnected)button.disabled=false;});}
  }
 };
 window.renderUsers=renderHotelUsers;
 window.renderSetupStatus=renderSetupCard;
 window.openSetupGuide=openSetupGuide;
 for(const name of ['saveConfig','saveRoom']){
  const original=window[name];if(typeof original!=='function')continue;
  window[name]=function(...args){const result=original.apply(this,args);Promise.resolve(syncQueue).then(()=>renderSetupCard());return result;};
 }
 const originalLoad=window.loadCloudState;
 window.loadCloudState=async function(...args){const result=await originalLoad.apply(this,args);renderSetupCard();return result;};
 window.SOONRE_SETUP={
  open:openSetupGuide,
  refresh:()=>renderSetupCard(),
  notifyBackupStatus(meta,owner=db.hotelId){if(!sameHotel(owner))return false;state.backups.set(owner,{at:Date.now(),meta:meta&&typeof meta==='object'?meta:null});renderSetupCard();return true;},
  clear(){state.people.clear();state.backups.clear();state.userGeneration++;document.getElementById('staffHotelContext')?.remove();}
 };
 const originalLogout=window.logout;
 if(typeof originalLogout==='function')window.logout=function(...args){window.SOONRE_SETUP.clear();return originalLogout.apply(this,args);};
})();

