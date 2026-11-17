(function(){
'use strict';var oldPayInvoice=payerFacture,oldInvoice=viewFacture,oldStay=viewResa;
var oldBillStay=facturerSejour,oldOrder=viewCommande,oldPayOrder=payerCmd;
var oldOrderFromDb=commandeFromDb,paymentState=null,busy=false;
var modes={espece:'Espèces',mobile:'Mobile Money',carte:'Carte',virement:'Virement'};
function cap(name){return window.soonreCapabilities&&window.soonreCapabilities[name]===true;}
function allowed(){return db.currentUser&&db.currentUser.actif===true&&['Super Administrateur','Directeur Général','Gérant','Accueil / Réception'].includes(db.currentUser.role);}
function owner(){return {hotel:db.hotelId,user:db.currentUser&&db.currentUser.id};}
function current(o){return o.hotel===db.hotelId&&o.user===(db.currentUser&&db.currentUser.id)&&allowed();}
function h(x){return escapeHtml(x);}
function amount(x){return Math.round(Number(x)*100)/100;}
function key(kind,id,o){return 'soonre-'+kind+':'+o.hotel+':'+o.user+':'+id;}
function readPending(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){throw Error('Reprise illisible. Actualisez avant de continuer.');}}
function persist(k,value){localStorage.setItem(k,JSON.stringify(value));if(localStorage.getItem(k)!==JSON.stringify(value))throw Error('Enregistrement de la reprise impossible. Paiement non envoyé.');}
function action(label,fn,style){var b=document.createElement('button');b.type='button';b.className='btn '+(style||'btn-ghost');b.textContent=label;b.onclick=fn;document.getElementById('modalFooter').append(b);return b;}
function errorText(id,text){var el=document.getElementById(id);if(el)el.textContent=text;else toast(text,'warning');}
function fmtSafe(x){return h(fmt(Number(x)||0));}
commandeFromDb=function(row){var c=oldOrderFromDb(row);if(Object.hasOwn(row,'ref_resa'))c.refResa=row.ref_resa;if(Object.hasOwn(row,'facture_sejour_id'))c.factureSejourId=row.facture_sejour_id;return c;};
var commandCore=CORE.find(function(x){return x[0]==='commandes';});if(commandCore)commandCore[3]=commandeFromDb;
payerCmd=function(id){var c=db.commandes.find(function(x){return x.id===id;});if(c&&c.factureSejourId){toast('Consommation déjà facturée au séjour : encaissez sa facture.','warning');return;}return oldPayOrder(id);};
function paymentRows(){
var s=paymentState;if(!s||!document.getElementById('stayPaymentRows'))return;
var box=document.getElementById('stayPaymentRows');box.replaceChildren();
s.rows.forEach(function(row,index){
var line=document.createElement('div');Object.assign(line.style,{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr) auto',gap:'6px',marginBottom:'8px'});
var select=document.createElement('select');select.className='form-control';select.setAttribute('aria-label','Mode de paiement '+(index+1));
Object.keys(modes).forEach(function(mode){var option=document.createElement('option');option.value=mode;option.textContent=modes[mode];select.append(option);});select.value=row.mode;select.disabled=!!s.pending;
select.onchange=function(){row.mode=select.value;updatePaymentTotals();};
var input=document.createElement('input');input.type='number';input.min='0.01';input.step='0.01';input.className='form-control';input.value=row.montant;input.disabled=!!s.pending;input.setAttribute('aria-label','Montant du paiement '+(index+1));input.oninput=function(){row.montant=Number(input.value);updatePaymentTotals();};
var remove=document.createElement('button');remove.type='button';remove.className='btn btn-sm btn-danger';remove.textContent='×';remove.setAttribute('aria-label','Supprimer le paiement '+(index+1));remove.disabled=!!s.pending;remove.onclick=function(){s.rows.splice(index,1);paymentRows();};
line.append(select,input,remove);box.append(line);
});updatePaymentTotals();
}
function updatePaymentTotals(){
var s=paymentState;if(!s)return;var target=amount(document.getElementById('stayPaymentTarget').value);
var sum=amount(s.rows.reduce(function(n,p){return n+(Number.isFinite(p.montant)?p.montant:0);},0));
var diff=amount(target-sum),label=document.getElementById('stayPaymentDifference');document.getElementById('stayPaymentSum').textContent=fmt(sum);
label.textContent=Math.abs(diff)<0.001?'Répartition exacte':diff>0?'À répartir : '+fmt(diff):'Répartition à réduire de '+fmt(-diff);label.style.color=Math.abs(diff)<0.001?'var(--success)':'var(--danger)';
}
payerFacture=function(id){
if(!cap('billing_split'))return oldPayInvoice(id);
if(!allowed()){toast('Encaissement non autorisé','warning');return;}
if(!cloudReady||recoveryBlocked||window.hotelSyncPending){toast('Actualisez les données et terminez la sauvegarde avant d’encaisser','warning');return;}
var f=db.factures.find(function(x){return x.id===id;});if(!f)return;
var o=owner(),pending,k=key('invoice-payment-v2',id,o);
try{pending=readPending(k);}catch(e){toast(e.message,'danger');return;}
if(!sessionActive()&&!pending){toast('Ouvrez la caisse avant d’encaisser','warning');return;}
var rest=amount(f.total-f.paye);
if(rest<=0&&!pending){toast('Cette facture est déjà réglée','warning');return;}
if(pending&&(!Array.isArray(pending.payments)||typeof pending.operation!=='string')){toast('Reprise invalide. Actualisez avant de continuer.','danger');return;}
var target=pending?amount(pending.payments.reduce(function(n,p){return n+Number(p.montant);},0)):rest;
var client=db.clients.find(function(x){return x.id===f.clientId;});
paymentState={id:id,owner:o,key:k,rest:rest,pending:pending,rows:pending?pending.payments.map(function(p){return {mode:p.mode,montant:Number(p.montant)};}):[{mode:'espece',montant:rest}]};
openModal('Encaisser la facture '+f.numero,
'<form id="stayPaymentForm"><p><strong>'+h(client?((client.prenom||'')+' '+client.nom):(f.clientNom||'Client'))+'</strong></p>'+
'<p>Solde affiché de la facture : <strong>'+fmtSafe(rest)+'</strong></p>'+
(pending?'<p role="status">Confirmation manquante. Réessayez la même répartition ; le serveur évite le doublon.</p>':'')+
'<div class="form-group"><label for="stayPaymentTarget">Montant à régler</label><input id="stayPaymentTarget" class="form-control" type="number" min="0.01" step="0.01" required value="'+h(target)+'" '+(pending?'readonly':'max="'+h(rest)+'"')+'></div>'+
'<h4>Modes du paiement</h4><div id="stayPaymentRows" style="margin-top:10px"></div><button type="button" id="stayPaymentAdd" class="btn btn-sm btn-gold">+ Mode de paiement</button>'+
'<div style="padding:12px;background:var(--gold-soft)"><div>Total réparti : <strong id="stayPaymentSum"></strong></div><div id="stayPaymentDifference" role="status"></div></div>'+
'<p id="stayPaymentError" role="alert"></p></form>','');
var form=document.getElementById('stayPaymentForm'),add=document.getElementById('stayPaymentAdd');add.disabled=!!pending;add.onclick=function(){if(paymentState.rows.length>=8){errorText('stayPaymentError','Huit modes maximum par opération.');return;}paymentState.rows.push({mode:'mobile',montant:0});paymentRows();};
document.getElementById('stayPaymentTarget').oninput=updatePaymentTotals;form.onsubmit=submitPayment;
action('Fermer',closeModal);var save=action(pending?'Réessayer la confirmation':'Valider le paiement',function(){form.requestSubmit();},'btn-green');save.id='stayPaymentSave';paymentRows();
};
async function submitPayment(event){
event.preventDefault();var s=paymentState,form=document.getElementById('stayPaymentForm');if(!s||!form||busy)return;
if(!current(s.owner)||!cap('billing_split')||!cloudReady||recoveryBlocked||(!sessionActive()&&!s.pending)){errorText('stayPaymentError','Connexion autorisée et caisse ouverte requises.');return;}
var target=amount(document.getElementById('stayPaymentTarget').value),payments=s.rows.map(function(p){return {mode:p.mode,montant:amount(p.montant)};});
if(!payments.length||payments.length>8||payments.some(function(p){return !Object.hasOwn(modes,p.mode)||!Number.isFinite(p.montant)||p.montant<=0;})||!Number.isFinite(target)||target<=0||(!s.pending&&target>s.rest)||Math.abs(amount(payments.reduce(function(n,p){return n+p.montant;},0))-target)>0.001){errorText('stayPaymentError','Montants positifs requis ; répartition exacte, sans dépasser le solde.');return;}
if(s.pending&&JSON.stringify(payments)!==JSON.stringify(s.pending.payments)){errorText('stayPaymentError','Réessayez exactement la répartition en attente.');return;}
var button=document.getElementById('stayPaymentSave');busy=true;button.disabled=true;button.textContent='Confirmation…';errorText('stayPaymentError','');
try{
await queueCloudSync();if(!current(s.owner)||window.hotelSyncPending||recoveryBlocked){errorText('stayPaymentError','Terminez la sauvegarde avant de réessayer.');return;}
var pending=s.pending||{operation:crypto.randomUUID(),payments:payments};persist(s.key,pending);s.pending=pending;
if(form.isConnected){document.getElementById('stayPaymentTarget').readOnly=true;document.getElementById('stayPaymentAdd').disabled=true;paymentRows();}
var result=await callServerRPC('encaisser_facture_reparti',{p_id:s.id,p_paiements:pending.payments,p_operation:pending.operation});
if(!current(s.owner))return;
if(result.error){errorText('stayPaymentError','Paiement non confirmé : '+result.error.message+'. Réessayez la même répartition.');return;}
localStorage.removeItem(s.key);if(form.isConnected)closeModal();
try{await loadCloudState();if(!current(s.owner))return;renderFactures();renderCaisse();renderReservations();toast('Paiement confirmé par le serveur');}
catch(e){cloudReady=false;toast('Paiement enregistré. Actualisez avant un nouvel encaissement.','warning');}
}catch(e){if(current(s.owner))errorText('stayPaymentError','Échec : '+e.message+'. Réessayez la même répartition.');}
finally{busy=false;if(button.isConnected){button.disabled=false;button.textContent=s.pending?'Réessayer la confirmation':'Valider le paiement';}}
}
viewFacture=function(id){
oldInvoice(id);var f=db.factures.find(function(x){return x.id===id;});if(!f)return;
var receipts=(db.caisse||[]).filter(function(x){return x.ref===id&&x.type==='entree';});
if(receipts.length){var section=document.createElement('section');section.innerHTML='<h4>Encaissements associés</h4><ul>'+receipts.map(function(r){return '<li>'+h(modes[r.mode]||r.mode)+' : '+fmtSafe(r.montant)+'</li>';}).join('')+'</ul>';document.getElementById('invoicePrint').append(section);}
if(cap('billing_split')&&Number(f.total)>Number(f.paye)&&allowed())action('Encaisser cette facture',function(){payerFacture(id);},'btn-green');
};
viewResa=function(id){oldStay(id);if(allowed())action('Relevé du séjour',function(){openStayStatement(id);},'btn-primary');};
window.openStayStatement=function(id){
var r=db.reservations.find(function(x){return x.id===id;});if(!r||!allowed())return;
var c=db.clients.find(function(x){return x.id===r.clientId;}),room=db.chambres.find(function(x){return x.id===r.chambreId;});
var orders=(db.commandes||[]).filter(function(x){return x.refResa===id&&x.statut!=='annulee';});
var invoices=(db.factures||[]).filter(function(x){return x.refResa===id;});
var total=amount(Number(r.montant)+orders.reduce(function(n,x){return n+Number(x.total||0);},0)),paid=amount(Number(r.paye)+orders.reduce(function(n,x){return n+Number(x.paye||0);},0));
openModal('Relevé du séjour '+r.ref,'<div id="soonreStayStatement"><h3>'+h(db.config.nom)+'</h3><p><strong>RELEVÉ — ne remplace pas les factures</strong></p><p>'+h(r.ref)+' · '+h(c?((c.prenom||'')+' '+c.nom):'Client')+' · Chambre '+h(room?room.numero:'—')+'</p><p>'+h(fmtDate(r.arrivee))+' au '+h(fmtDate(r.depart))+'</p><div style="overflow:auto"><table><thead><tr><th>Élément</th><th>Montant</th><th>Payé</th><th>Solde</th></tr></thead><tbody><tr><td>Hébergement</td><td>'+fmtSafe(r.montant)+'</td><td>'+fmtSafe(r.paye)+'</td><td>'+fmtSafe(r.montant-r.paye)+'</td></tr>'+orders.map(function(x){return '<tr><td>Restaurant '+h(x.numero)+'</td><td>'+fmtSafe(x.total)+'</td><td>'+fmtSafe(x.paye)+'</td><td>'+fmtSafe(x.total-x.paye)+'</td></tr>';}).join('')+'</tbody></table></div><p>Total du séjour : <strong>'+fmtSafe(total)+'</strong> · Payé : <strong>'+fmtSafe(paid)+'</strong> · Solde : <strong>'+fmtSafe(total-paid)+'</strong></p><p>Consommations explicitement rattachées uniquement.</p></div><h4>Factures associées</h4><div id="stayInvoiceLinks"></div><p id="stayBillingError" role="alert"></p>','');
var list=document.getElementById('stayInvoiceLinks');if(!invoices.length)list.textContent='Aucune facture.';
invoices.forEach(function(f){var b=document.createElement('button');b.type='button';b.className='btn btn-ghost';b.textContent=f.numero+' — solde '+fmt(f.total-f.paye);b.onclick=function(){viewFacture(f.id);};list.append(b);});
action('Fermer',closeModal);action('Imprimer le relevé',printStayStatement,'btn-gold');
if(cap('stay_billing')&&r.statut!=='annulee'){var b=action('Facturer le solde non facturé',function(){billFullStay(id,b);},'btn-primary');}
else{var p=document.createElement('p');p.textContent='Facturation regroupée non activée sur le serveur.';document.getElementById('modalBody').append(p);}
};
function printStayStatement(){
var report=document.getElementById('soonreStayStatement');if(!report)return;var html=printableReport('soonreStayStatement'),w=window.open('','_blank');
if(!w){toast('Autorisez les fenêtres surgissantes pour imprimer ce relevé.','warning');return;}
w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Relevé de séjour</title><style>body{font:14px Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #ccc}@page{size:A4;margin:15mm}</style></head><body>'+html+'<script>window.onload=function(){window.print()};<\/script></body></html>');w.document.close();
}
var stayBusy=new Set();
async function billFullStay(id,button){
if(stayBusy.has(id)||!allowed()||!cap('stay_billing'))return;
if(!cloudReady||recoveryBlocked){errorText('stayBillingError','Connexion et sauvegarde terminée requises.');return;}
var o=owner(),k=key('stay-invoice-v2',id,o);stayBusy.add(id);if(button)button.disabled=true;
try{
await queueCloudSync();if(!current(o)||window.hotelSyncPending||recoveryBlocked)return;
var pending=readPending(k)||{operation:crypto.randomUUID(),tva:Number(db.config.tva)};if(!Number.isFinite(pending.tva)||pending.tva<0||pending.tva>100)throw Error('Taux TVA invalide');
persist(k,pending);var result=await callServerRPC('facturer_sejour_complet',{p_id:id,p_tva:pending.tva,p_operation:pending.operation});
if(!current(o))return;if(result.error){errorText('stayBillingError','Facturation non confirmée : '+result.error.message+'. Réessayez la même opération.');return;}
localStorage.removeItem(k);var invoiceId=result.data&&result.data.facture_id;if(!invoiceId)throw Error('Référence de facture absente');
try{await loadCloudState();if(current(o)){renderReservations();renderFactures();viewFacture(invoiceId);}}
catch(e){cloudReady=false;toast('Facture créée. Actualisez les données.','warning');}
}catch(e){if(current(o))errorText('stayBillingError','Facturation impossible : '+e.message);}
finally{stayBusy.delete(id);if(button&&button.isConnected)button.disabled=false;}
}
facturerSejour=function(id){if(cap('stay_billing'))return openStayStatement(id);return oldBillStay(id);};
viewCommande=function(id){
oldOrder(id);var c=db.commandes.find(function(x){return x.id===id;});if(!c||!allowed())return;
if(c.refResa)action('Consulter le séjour',function(){openStayStatement(c.refResa);},'btn-primary');
else if(cap('stay_link')&&!c.factureSejourId&&Number(c.paye)===0&&c.statut!=='annulee')action('Rattacher à un séjour',function(){openAttachOrder(id);},'btn-primary');
};
function openAttachOrder(id){
var c=db.commandes.find(function(x){return x.id===id;});if(!c||!allowed()||!cap('stay_link')||c.refResa||c.factureSejourId||Number(c.paye)>0)return;
var choices=db.reservations.filter(function(r){return r.statut!=='annulee';});
openModal('Rattacher la commande '+c.numero,'<form id="attachStayOrderForm"><p>Choisissez le séjour du client, pas seulement sa chambre.</p><div class="form-group"><label for="attachStayReservation">Séjour *</label><select id="attachStayReservation" class="form-control" required><option value="">— Choisir un séjour —</option>'+choices.map(function(r){var client=db.clients.find(function(x){return x.id===r.clientId;}),room=db.chambres.find(function(x){return x.id===r.chambreId;});return '<option value="'+h(r.id)+'">'+h(r.ref+' · '+(client?((client.prenom||'')+' '+client.nom):'Client')+' · chambre '+(room?room.numero:'—')+' · '+fmtDate(r.arrivee)+' au '+fmtDate(r.depart))+'</option>';}).join('')+'</select></div><p id="attachStayError" role="alert"></p></form>','');
var form=document.getElementById('attachStayOrderForm'),o=owner(),saving=false;action('Annuler',closeModal);
var button=action('Rattacher au séjour',function(){form.requestSubmit();},'btn-primary');
form.onsubmit=async function(event){
event.preventDefault();if(saving)return;var selected=document.getElementById('attachStayReservation').value;if(!selected)return;
if(!current(o)||!cloudReady||recoveryBlocked){errorText('attachStayError','Connexion serveur requise.');return;}
saving=true;button.disabled=true;
try{
await queueCloudSync();if(!current(o)||window.hotelSyncPending||recoveryBlocked)return;
var version=baselineVersions.get('commandes:'+id);if(version==null)throw Error('Actualisez cette commande');
var result=await callServerRPC('attacher_commande_sejour',{p_commande:id,p_reservation:selected,p_version:version});
if(!current(o))return;if(result.error){errorText('attachStayError','Rattachement non confirmé : '+result.error.message);return;}
try{await loadCloudState();if(current(o)){renderCommandes();openStayStatement(selected);}}
catch(e){cloudReady=false;toast('Rattachement confirmé. Actualisez.','warning');}
}catch(e){if(current(o))errorText('attachStayError',e.message);}
finally{saving=false;if(button.isConnected)button.disabled=false;}
};
}
window.SOONRE_BILLING={openStatement:window.openStayStatement,hasCapability:cap,canBill:allowed,isBusy:()=>busy||stayBusy.size>0};
})();
