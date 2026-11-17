/* Confirmed synchronization, hotel-scoped refresh and reviewed atomic import. */
(function(){
'use strict';
const capabilities={housekeeping:false,billing_split:false,stay_billing:false,stay_link:false,backups:false};
window.soonreCapabilities=window.SOONRE_CAPABILITIES=capabilities;
let context='',lastRead=null,lastWrite=null,refreshFailed=false,remoteChanged=false,checking=false,importPreview=null;
const contextKey=()=>db.hotelId+':'+db.currentUser?.id;
const same=owner=>owner===contextKey()&&db.currentUser?.actif;
const safe=()=>cloudReady&&db.currentUser?.actif&&!recoveryBlocked&&!window.hotelSyncPending;
const stamp=value=>new Date(value).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const originalLoad=loadCloudState,originalSync=queueCloudSync;
loadCloudState=async function(...args){
 const owner=contextKey();
 if(context!==owner){context=owner;lastRead=null;lastWrite=null;for(const k of Object.keys(capabilities))capabilities[k]=false;}
 try{
  const result=await originalLoad.apply(this,args);if(!same(owner))return result;
  lastRead=Date.now();refreshFailed=false;remoteChanged=false;
  const reply=await callServerRPC('capacites_hotel',{p_hotel:db.hotelId});
  if(same(owner)&&!reply.error&&reply.data)for(const k of Object.keys(capabilities))capabilities[k]=reply.data[k]===true;
  updateSyncStatus();return result;
 }catch(error){if(same(owner)){refreshFailed=true;updateSyncStatus();}throw error;}
};
queueCloudSync=function(...args){
 const owner=contextKey(),wasPending=window.hotelSyncPending;
 let hasChanges=false;
 if(cloudReady){const rows=snapshotRows();hasChanges=rows.size!==cloudBaseline.size||[...rows].some(([k,r])=>cloudBaseline.get(k)!==JSON.stringify(r.data));}
 const job=originalSync.apply(this,args);
 return Promise.resolve(job).then(result=>{if(same(owner)&&safe()&&(wasPending||hasChanges))lastWrite=Date.now();updateSyncStatus();return result;});
};
updateSyncStatus=function(){
 if(!db.currentUser)return;
 const host=document.querySelector('.topbar-right');if(!host)return;
 let button=document.getElementById('syncStatus');
 if(!button){button=document.createElement('button');button.id='syncStatus';button.className='btn btn-sm btn-ghost';button.setAttribute('aria-live','polite');host.prepend(button);}
 button.textContent=recoveryBlocked?'⚠ Modifications à récupérer':!navigator.onLine?'Hors ligne — connexion requise':window.hotelSyncPending?'Modifications en attente…':refreshFailed?'Actualisation impossible':!cloudReady?'Connexion au serveur…':remoteChanged?'Nouvelles données — actualiser':lastWrite?'✓ Enregistré à '+stamp(lastWrite):lastRead?'Données reçues à '+stamp(lastRead):'Confirmation serveur attendue';
 button.onclick=()=>{if(recoveryBlocked||window.hotelSyncPending)showRecoveryAction();else refreshRemote(true);};
};
async function remoteVersions(owner){
 const entries=[];
 for(const table of [...CORE.map(x=>x[1]),'app_collections']){
  for(let start=0;;start+=500){
   const {data,error}=await sb.from(table).select(table==='app_collections'?'id,version,name':'id,version').eq('hotel_id',owner).order('id').range(start,start+499);
   if(error)throw Error(error.message);
   for(const row of data)if(table!=='app_collections'||moduleAccessible(row.name))entries.push([table+':'+row.id,Number(row.version)]);
   if(data.length<500)break;
  }
 }
 return JSON.stringify(entries.sort((a,b)=>a[0].localeCompare(b[0])));
}
function baselineFingerprint(){return JSON.stringify([...baselineVersions].map(([k,v])=>[k,Number(v)]).sort((a,b)=>a[0].localeCompare(b[0])));}
function editing(){return document.getElementById('modalOverlay')?.classList.contains('active')||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')||window.SOONRE_HOUSEKEEPING?.isBusy()||window.SOONRE_BILLING?.isBusy?.();}
async function refreshRemote(force=false){
 if(checking||!db.currentUser?.actif||recoveryBlocked||window.hotelSyncPending||!navigator.onLine||(!force&&document.hidden))return false;
 const owner=contextKey(),hotel=db.hotelId;checking=true;
 try{
  if(!cloudReady){if(!force)return false;await loadCloudState({preserveLocalModules:false});if(same(owner)){const page=document.querySelector('.page.active')?.id?.replace('page-','');if(page)showPage(page);}return true;}
  const fingerprint=await remoteVersions(hotel);if(!same(owner)||!safe())return false;
  remoteChanged=fingerprint!==baselineFingerprint();refreshFailed=false;
  if((remoteChanged||force)&&!editing()){
   await loadCloudState({preserveLocalModules:false});
   if(same(owner)){const page=document.querySelector('.page.active')?.id?.replace('page-','');if(page)showPage(page);}
  }else if(force&&editing())toast('Fermez la fenêtre ou terminez la saisie avant d’actualiser','warning');
  updateSyncStatus();return true;
 }catch(error){if(same(owner)){refreshFailed=true;updateSyncStatus();if(force)toast('Actualisation échouée : '+error.message,'warning');}return false;}
 finally{checking=false;}
}
setInterval(()=>refreshRemote(),45000);
window.addEventListener('focus',()=>refreshRemote());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRemote();});
window.SOONRE_RELIABILITY={refresh:refreshRemote,remoteVersions};
function download(value,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function envelope(){return {format:'soonre-business-backup',formatVersion:3,hotelId:db.hotelId,exportedAt:new Date().toISOString(),serverConfirmed:!!safe(),tables:exportSnapshot()};}
exportData=async function(){if(!requireManager())return;const owner=contextKey();await queueCloudSync();if(!same(owner))return;download(envelope(),'soonre-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json');toast(safe()?'Export métier téléchargé':'Copie locale téléchargée : modifications serveur non confirmées',safe()?'success':'warning');};
window.getHotelBackupStatus=async function(){
 if(!isManager()||!capabilities.backups)return null;
 const owner=contextKey(),{data,error}=await callServerRPC('etat_sauvegardes_hotel',{p_hotel:db.hotelId});
 if(!same(owner)||error||!data)return null;
 return {lastSuccessfulAt:data.last_successful_at,scheduled:data.scheduled===true,scheduleLabel:data.schedule_label,restoreTestedAt:data.restore_tested_at,sameDatabase:data.same_database===true};
};
window.openHotelBackupPanel=async function(){
 if(!requireManager())return;
 const owner=contextKey(),meta=await window.getHotelBackupStatus();if(!same(owner))return;
 openModal('Sauvegardes de cet hôtel','<p id="hotelBackupInfo"></p><p>Les copies serveur restent dans la même base. Conservez aussi un export dans un emplacement distinct. Les comptes et mots de passe sont gérés séparément.</p>','');
 const text=meta?.lastSuccessfulAt?'Dernière copie serveur : '+new Date(meta.lastSuccessfulAt).toLocaleString('fr-FR')+'. ':'Aucune copie serveur confirmée. ';
 document.getElementById('hotelBackupInfo').textContent=text+(meta?.scheduled?meta.scheduleLabel:'Programmation automatique non confirmée.');
 const add=(label,fn)=>{const b=document.createElement('button');b.className='btn btn-primary';b.textContent=label;b.onclick=fn;document.getElementById('modalFooter').append(b);return b;};
 add('Télécharger l’export',()=>exportData());
 if(capabilities.backups){const b=add('Créer une copie serveur',async()=>{if(!same(owner)||!safe())return;b.disabled=true;const {error}=await callServerRPC('creer_sauvegarde_hotel',{p_hotel:db.hotelId});if(!same(owner))return;if(error){b.disabled=false;toast(error.message,'danger');}else{const status=await window.getHotelBackupStatus();if(same(owner))window.SOONRE_SETUP?.notifyBackupStatus(status,db.hotelId);window.openHotelBackupPanel();}});}
};
function parseBackup(value){
 if(value?.format==='soonre-business-backup'){
  if(value.formatVersion!==3||value.hotelId!==db.hotelId)throw Error('Version incompatible ou sauvegarde d’un autre hôtel');value=value.tables;
 }else if(value?.format||value?.tables)throw Error('Format de sauvegarde non reconnu');
 validateImport(value);if(!Object.keys(value).some(k=>IMPORT_KEYS.includes(k)))throw Error('Aucune collection métier reconnue');return value;
}
function importChanges(data){
 const updates=[],deletes=[];let added=0,changed=0,removed=0;
 for(const [key,table,toDb] of CORE){if(!Object.hasOwn(data,key))continue;const incoming=new Map(data[key].map(item=>{const row=toDb(item);return [row.id,row];}));
  for(const [id,row] of incoming){const k=table+':'+id;if(cloudBaseline.get(k)===JSON.stringify(row))continue;updates.push({table,id,data:row,version:baselineVersions.get(k)??null});if(cloudBaseline.has(k))changed++;else added++;}
  for(const item of db[key])if(!incoming.has(item.id)){deletes.unshift({table,id:item.id,version:baselineVersions.get(table+':'+item.id),delete:true});removed++;}
 }
 for(const name of MODULES){if(!Object.hasOwn(data,name))continue;const id=db.hotelId+':'+name,k='app_collections:'+id,row={id,hotel_id:db.hotelId,name,data:data[name]};if(JSON.stringify(row)!==cloudBaseline.get(k)){updates.push({table:'app_collections',id,data:row,version:baselineVersions.get(k)??null});if(cloudBaseline.has(k))changed++;else added++;}}
 return {changes:[...deletes,...updates],added,changed,removed};
}
async function previewImport(value){
 if(!requireManager()||!safe())throw Error('Confirmez la synchronisation avant de restaurer');
 const owner=contextKey(),data=parseBackup(value),result=importChanges(data),fingerprint=await remoteVersions(db.hotelId);
 if(!same(owner)||!safe())throw Error('Hôtel ou synchronisation changé');
 if(fingerprint!==baselineFingerprint())throw Error('Les données serveur ont changé. Actualisez puis recommencez l’aperçu');
 importPreview={owner,result,fingerprint};
 openModal('Vérifier la restauration',`<p>${result.added} ajout(s), ${result.changed} modification(s), ${result.removed} suppression(s).</p><p>Les opérations seront vérifiées ensemble par le serveur. Les protections des paiements et des séjours restent appliquées.</p><label for="restoreConfirmation">Saisissez RESTAURER pour confirmer</label><input id="restoreConfirmation" class="form-control" autocomplete="off">`,'');
 const b=document.createElement('button');b.className='btn btn-danger';b.textContent='Appliquer la restauration';b.onclick=()=>applyImport(b);document.getElementById('modalFooter').append(b);
}
async function applyImport(button){
 const plan=importPreview;if(!plan||!same(plan.owner)||!safe()||document.getElementById('restoreConfirmation')?.value!=='RESTAURER')return;
 button.disabled=true;
 try{
  if(await remoteVersions(db.hotelId)!==plan.fingerprint)throw Error('Modification distante détectée : recommencez l’aperçu');
  if(!same(plan.owner)||!safe())throw Error('Hôtel ou synchronisation changé');
  if(capabilities.backups){const saved=await callServerRPC('creer_sauvegarde_hotel',{p_hotel:db.hotelId});if(saved.error)throw Error('Copie préalable non créée : '+saved.error.message);}else download(envelope(),'soonre-avant-restauration.json');
  if(!same(plan.owner)||!safe())throw Error('Hôtel ou synchronisation changé');
  const {error}=await callServerRPC('sync_hotel_changes',{p_hotel:db.hotelId,p_changes:plan.result.changes});
  if(!same(plan.owner))return;
  if(error)throw Error(error.message);
  importPreview=null;closeModal();await loadCloudState({preserveLocalModules:false});renderAll();toast('Restauration confirmée par le serveur');
 }catch(error){if(same(plan.owner)){cloudReady=false;toast('Restauration non confirmée : '+error.message+'. Actualisez les données avant de réessayer.','danger');updateSyncStatus();}}finally{if(button.isConnected)button.disabled=false;}
}
importData=async function(event){
 if(!requireManager())return;const file=event.target.files?.[0];if(!file)return;
 const owner=contextKey();event.target.value='';
 try{if(file.size>10485760)throw Error('Fichier supérieur à 10 Mo');const text=await file.text();if(!same(owner))return;await previewImport(JSON.parse(text));}catch(error){if(same(owner))toast('Import refusé : '+error.message,'danger');}
};
window.SOONRE_BACKUPS={parse:parseBackup,preview:previewImport,changes:importChanges};
})();
