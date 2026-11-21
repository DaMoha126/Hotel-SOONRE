/* Staff chat: server-scoped access, bounded history, active-page networking only. */
(function(){
'use strict';
const el=id=>document.getElementById(id),page=el('page-messagerie'),nav=document.querySelector('[data-page="messagerie"]');
const roles=['Super Administrateur','Directeur Général','Gérant','Accueil / Réception','Ménage','Maintenance'];
let generation=0,scope=null,timer=null,channel=null,reading=false,sending=false,pending=null,rows=[],before=null,signature='',realtime=false,queuedRefresh=false;
const drafts=new Map(),allowed=()=>db.currentUser?.actif===true&&roles.includes(db.currentUser.role)&&!!db.hotelId;
const key=s=>'soonre-chat-pending:'+s.user+':'+s.hotel;
const current=(s,g)=>scope===s&&g===generation&&db.hotelId===s.hotel&&db.currentUser?.id===s.user&&allowed()&&page.classList.contains('active');
const text=(id,value)=>{el(id).textContent=value;};
function controls(){el('chatText').readOnly=!!pending;el('chatSend').disabled=!scope||sending||!navigator.onLine;el('chatSend').textContent=sending?'Envoi…':pending?'Réessayer l’envoi':'Envoyer';el('chatPrevious').disabled=reading||rows.length<50;el('chatLatest').hidden=before===null;text('chatCount',el('chatText').value.length+' / 4 000');}
function status(){text('chatConnection',!navigator.onLine?'Hors ligne · envoi indisponible':document.hidden?'Actualisation en pause':realtime?'Discussion connectée':'Actualisation toutes les 12 secondes');}
function disconnect(){clearTimeout(timer);timer=null;if(channel){const old=channel;channel=null;try{Promise.resolve(sb.removeChannel(old)).catch(()=>{});}catch(_){} }realtime=false;}
function stop(){if(scope&&!pending)drafts.set(key(scope),el('chatText').value);generation++;disconnect();scope=null;reading=false;queuedRefresh=false;sending=false;pending=null;rows=[];before=null;signature='';el('chatMessages').replaceChildren();el('chatMembers').replaceChildren();el('chatText').value='';el('chatText').readOnly=false;el('chatComposer').hidden=true;text('chatError','');text('chatMemberCount','');text('chatHotel','');controls();}
function storePending(s,value){if(value)sessionStorage.setItem(key(s),JSON.stringify(value));else sessionStorage.removeItem(key(s));}
function restorePending(s){try{const p=JSON.parse(sessionStorage.getItem(key(s))||'null');return p&&/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(p.id)&&typeof p.body==='string'&&p.body.length<=4000?p:null;}catch(_){return null;}}
function clearConfirmed(s,msgs){if(pending&&msgs.some(m=>m.client_id===pending.id&&m.auteur_id===s.user&&m.texte===pending.body.trim())){try{storePending(s,null);}catch(_){}pending=null;el('chatText').value='';drafts.delete(key(s));controls();}}
function render(messages,force=false){
 const next=messages.map(m=>m.id).join(',');if(!force&&next===signature)return;signature=next;
 const box=el('chatMessages'),bottom=box.scrollHeight-box.scrollTop-box.clientHeight<80,oldScroll=box.scrollTop;box.replaceChildren();
 if(!messages.length){const p=document.createElement('p');p.className='chat-empty';p.textContent=before===null?'La discussion commence ici. Écrivez le premier message à votre équipe.':'Aucun message plus ancien.';box.append(p);}
 for(const m of messages){const item=document.createElement('article');item.className='chat-message'+(m.auteur_id===scope.user?' is-own':'');const meta=document.createElement('div');meta.className='chat-meta';const name=document.createElement('strong');name.textContent=m.auteur_nom;const role=document.createElement('span');role.textContent=m.auteur_role;const time=document.createElement('time');time.dateTime=m.created_at;time.textContent=new Date(m.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});meta.append(name,role,time);const body=document.createElement('p');body.textContent=m.texte;item.append(meta,body);box.append(item);}
 if(force||bottom)box.scrollTop=box.scrollHeight;else{box.scrollTop=oldScroll;el('chatNew').hidden=false;}
}
function failure(error,s,g){if(!current(s,g))return;text('chatError',error?.code==='42501'?'Cette discussion est réservée aux membres actifs de cet hôtel.':error?.code==='PGRST202'?'La messagerie est momentanément indisponible. Réessayez plus tard.':'Connexion interrompue. Vérifiez votre réseau puis réessayez.');if(error?.code==='42501'){disconnect();rows=[];signature='';el('chatMessages').replaceChildren();el('chatMembers').replaceChildren();el('chatComposer').hidden=true;text('chatMemberCount','');}}
async function refresh(force=false){
 const s=scope,g=generation;if(!s||document.hidden)return;if(reading){queuedRefresh=true;return;}const cursor=before;reading=true;controls();
 try{const result=await callServerRPC('lire_messages_hotel',{p_hotel:s.hotel,p_avant:cursor});if(!current(s,g))return;if(cursor!==before){queuedRefresh=true;return;}if(result.error){failure(result.error,s,g);return;}if(!Array.isArray(result.data))throw Error('Réponse invalide');rows=result.data;clearConfirmed(s,rows);render(rows,force);el('chatComposer').hidden=false;text('chatError',pending?'Envoi non confirmé. Réessayez avec le même message pour éviter un doublon.':'');}
 catch(error){failure(error,s,g);}finally{if(current(s,g)){reading=false;controls();if(queuedRefresh){queuedRefresh=false;queueMicrotask(()=>refresh(true));}}}
}
async function members(s,g){try{const result=await callServerRPC('membres_messagerie_hotel',{p_hotel:s.hotel});if(!current(s,g))return;if(result.error){failure(result.error,s,g);return;}const list=el('chatMembers');list.replaceChildren();for(const member of result.data||[]){const li=document.createElement('li'),name=document.createElement('strong'),role=document.createElement('span');name.textContent=member.nom;role.textContent=member.role;li.append(name,role);list.append(li);}text('chatMemberCount',(result.data||[]).length+' membre(s) actif(s)');}catch(error){failure(error,s,g);}}
function schedule(s,g){clearTimeout(timer);if(!current(s,g)||document.hidden)return;timer=setTimeout(async()=>{if(!current(s,g))return;await refresh();if(current(s,g)){await members(s,g);schedule(s,g);}},12000);}
function connect(s,g){
 if(!current(s,g)||document.hidden)return;
 try{channel=sb.channel('hotel-chat:'+s.hotel+':'+g).on('postgres_changes',{event:'INSERT',schema:'public',table:'hotel_messages',filter:'hotel_id=eq.'+s.hotel},()=>{if(current(s,g)&&before===null)refresh();}).subscribe(state=>{if(!current(s,g))return;realtime=state==='SUBSCRIBED';status();});}catch(_){realtime=false;}status();schedule(s,g);
}
function enter(){stop();if(!allowed())return;const s=scope={hotel:db.hotelId,user:db.currentUser.id},g=generation;text('chatHotel',db.config?.nom||'Hôtel actif');pending=restorePending(s);el('chatText').value=pending?.body||drafts.get(key(s))||'';el('chatComposer').hidden=true;text('chatError','Chargement de la discussion…');controls();refresh(true);members(s,g);connect(s,g);}
async function send(event){
 event?.preventDefault();const s=scope,g=generation;if(!s||sending||!current(s,g))return;
 const body=pending?.body||el('chatText').value.trim();if(!body||body.length>4000){text('chatError','Écrivez un message de 1 à 4 000 caractères.');return;}
 if(!navigator.onLine){text('chatError','Connectez-vous à Internet pour envoyer votre message.');return;}
 try{if(!pending){pending={id:crypto.randomUUID(),body};storePending(s,pending);}}catch(_){pending=null;text('chatError','Le stockage de session est indisponible. Autorisez-le pour sécuriser les nouvelles tentatives d’envoi.');controls();return;}
 const operation=pending;sending=true;controls();text('chatError','');
 try{const result=await callServerRPC('envoyer_message_hotel',{p_hotel:s.hotel,p_id:operation.id,p_texte:operation.body});if(!current(s,g))return;if(!pending){text('chatError','');return;}if(result.error){if(['22023','42501','23514','54000'].includes(result.error.code)){try{storePending(s,null);}catch(_){}pending=null;text('chatError',result.error.code==='54000'?'Trop de messages. Patientez une minute.':result.error.code==='42501'?'Vous ne pouvez plus envoyer de message dans cet hôtel.':'Message refusé. Vérifiez son contenu.');if(result.error.code==='42501')failure(result.error,s,g);}else text('chatError','Envoi non confirmé. Réessayez : le même message ne sera pas envoyé deux fois.');return;}if(!result.data?.id)throw Error('Confirmation absente');storePending(s,null);pending=null;el('chatText').value='';drafts.delete(key(s));before=null;await refresh(true);}
 catch(_){if(current(s,g))text('chatError','Envoi non confirmé. Réessayez : le même message ne sera pas envoyé deux fois.');}
 finally{if(current(s,g)){sending=false;controls();}}
}
el('chatComposer').addEventListener('submit',send);
el('chatText').addEventListener('input',()=>{if(scope&&!pending)drafts.set(key(scope),el('chatText').value);controls();});
el('chatText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send();}});
el('chatPrevious').onclick=()=>{if(!reading&&rows.length){before=rows[0].id;refresh(true);}};
el('chatLatest').onclick=()=>{before=null;refresh(true);};el('chatRefresh').onclick=()=>{refresh();if(scope)members(scope,generation);};
el('chatNew').onclick=()=>{el('chatMessages').scrollTop=el('chatMessages').scrollHeight;el('chatNew').hidden=true;};
document.addEventListener('visibilitychange',()=>{if(!scope)return;if(document.hidden){disconnect();status();}else enter();});
window.addEventListener('online',()=>{status();controls();refresh();});window.addEventListener('offline',()=>{status();controls();});
const originalPage=showPage;showPage=function(name){if(name!=='messagerie'){stop();return originalPage.apply(this,arguments);}if(!allowed()){stop();toast('Messagerie réservée aux membres actifs de l’hôtel','warning');return;}document.querySelector('.page.active')?.classList.remove('active');document.querySelector('.nav-item.active')?.classList.remove('active');page.classList.add('active');nav.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.setAttribute('aria-current',n===nav?'page':'false'));text('pageTitle','Messagerie');text('pageBreadcrumb','La discussion de votre équipe');if(innerWidth<=900)toggleSidebar(true);enter();};
const originalMenu=filtrerMenuParRole;filtrerMenuParRole=function(){const result=originalMenu.apply(this,arguments);nav.style.display=allowed()?'':'none';if(!allowed())stop();return result;};nav.style.display=allowed()?'':'none';
const originalLoad=loadCloudState;loadCloudState=async function(){const active=page.classList.contains('active'),hotel=db.hotelId,user=db.currentUser?.id;if(active)stop();const result=await originalLoad.apply(this,arguments);if(active&&page.classList.contains('active')&&hotel===db.hotelId&&user===db.currentUser?.id)enter();return result;};
const originalLogout=logout;logout=async function(){const result=await originalLogout.apply(this,arguments);if(!db.currentUser){stop();drafts.clear();try{for(const k of Object.keys(sessionStorage))if(k.startsWith('soonre-chat-pending:'))sessionStorage.removeItem(k);}catch(_){}}return result;};
})();
