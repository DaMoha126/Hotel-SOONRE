
/* =====================================================
   RAABO AMZARA — HÔTEL SOONRÉ
   Logiciel de gestion hôtelière v1.0.0
   Hadotech © 2026
===================================================== */

// ============ SUPABASE ============
const SUPABASE_URL = 'https://gjgknrkwvjmkemcetngc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZ2tucmt3dmpta2VtY2V0bmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODkwMTAsImV4cCI6MjEwNTE2NTAxMH0.Gf75kqQD75uPexTJWfGB4LJ6fGnQdQsqnLF7pQqFJ44';
const sb = (SUPABASE_URL.startsWith('http') && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function loginToEmail(login){return login.includes('@')?login.toLowerCase():login.toLowerCase()+'@hotelsoonre.local';}

// -- Conversion JS (camelCase, dans db.*) <-> lignes Supabase (snake_case) --
function chambreToDb(c){
  return { id:c.id, hotel_id:db.hotelId, numero:c.numero, type:c.type, bloc:c.bloc||null,
    etage:c.etage??1, capacite:c.capacite||1, prix:c.prix||0, statut:c.statut,
    climatisee:!!c.climatisee, eau_chaude:!!c.eauChaude, equipements:c.equipements||null };
}
function chambreFromDb(r){
  return { id:r.id, numero:r.numero, type:r.type, bloc:r.bloc, etage:r.etage, capacite:r.capacite,
    prix:Number(r.prix), statut:r.statut, climatisee:r.climatisee, eauChaude:r.eau_chaude, equipements:r.equipements };
}
function clientToDb(c){
  return { id:c.id, hotel_id:db.hotelId, nom:c.nom, prenom:c.prenom||null, type:c.type||'Particulier',
    tel:c.tel||null, email:c.email||null, ville:c.ville||null, pays:c.pays||null, piece:c.piece||null,
    num_piece:c.numPiece||null, note:c.note||null };
}
function clientFromDb(r){
  return { id:r.id, nom:r.nom, prenom:r.prenom, type:r.type, tel:r.tel, email:r.email, ville:r.ville,
    pays:r.pays, piece:r.piece, numPiece:r.num_piece, note:r.note };
}
function reservationToDb(r){
  return { id:r.id, hotel_id:db.hotelId, ref:r.ref||null, client_id:r.clientId||null, chambre_id:r.chambreId||null,
    arrivee:r.arrivee, depart:r.depart, nuits:r.nuits||null, montant:r.montant||0, paye:r.paye||0,
    statut:r.statut, note:r.note||null };
}
function reservationFromDb(r){
  return { id:r.id, ref:r.ref, clientId:r.client_id, chambreId:r.chambre_id, arrivee:r.arrivee, depart:r.depart,
    nuits:r.nuits, montant:Number(r.montant), paye:Number(r.paye), statut:r.statut, note:r.note };
}
function factureToDb(f){
  return { id:f.id, hotel_id:db.hotelId, numero:f.numero||null, date:f.date||null, client_id:f.clientId||null,
    client_nom:f.clientNom||null, type:f.type||null, lignes:f.lignes||[], total_ht:f.totalHT||null, tva:f.tva||null,
    total:f.total||0, paye:f.paye||0, statut:f.statut, ref_resa:f.refResa||null, ref_cmd:f.refCmd||null, metadata:Object.fromEntries(['clientTel','objet','ssTotal','remisePct','remise','tvaPct','notes','sourceType','sourceId','sourceNumero'].filter(k=>f[k]!==undefined).map(k=>[k,f[k]])) };
}
function factureFromDb(r){
  return { ...Object.fromEntries(['clientTel','objet','ssTotal','remisePct','remise','tvaPct','notes','sourceType','sourceId','sourceNumero'].filter(k=>Object.hasOwn(r.metadata||{},k)).map(k=>[k,r.metadata[k]])), id:r.id, numero:r.numero, date:r.date, clientId:r.client_id, clientNom:r.client_nom, type:r.type,
    lignes:r.lignes||[], totalHT:r.total_ht, tva:r.tva, total:Number(r.total), paye:Number(r.paye),
    statut:r.statut, refResa:r.ref_resa, refCmd:r.ref_cmd };
}

function menuToDb(m){
  return { id:m.id, hotel_id:db.hotelId, nom:m.nom, categorie:m.categorie||null, envoi:m.envoi||null,
    prix:m.prix||0, cout:m.cout||null, disponible:!!m.disponible, description:m.description||null };
}
function menuFromDb(r){
  return { id:r.id, nom:r.nom, categorie:r.categorie, envoi:r.envoi, prix:Number(r.prix), cout:r.cout,
    disponible:r.disponible, description:r.description };
}
function commandeToDb(c){
  return { id:c.id, hotel_id:db.hotelId, numero:c.numero||null, date:c.date||null, type_service:c.typeService||null,
    table_nom:c.table||null, chambre_id:c.chambreId||null, client_nom:c.clientNom||null, couverts:c.couverts||null,
    serveur:c.serveur||null, adresse:c.adresse||null, tel:c.tel||null, lignes:c.lignes||[], ss_total:c.ssTotal||null,
    remise_pct:c.remisePct||null, remise:c.remise||null, pourboire:c.pourboire||null, total:c.total||0,
    notes_gen:c.notesGen||null, statut:c.statut, paye:c.paye||0, metadata:c.metadata||{} };
}
function commandeFromDb(r){
  return { id:r.id, numero:r.numero, date:r.date, typeService:r.type_service, table:r.table_nom, chambreId:r.chambre_id,
    clientNom:r.client_nom, couverts:r.couverts, serveur:r.serveur, adresse:r.adresse, tel:r.tel, lignes:r.lignes||[],
    ssTotal:r.ss_total, remisePct:r.remise_pct, remise:r.remise, pourboire:r.pourboire, total:Number(r.total),
    notesGen:r.notes_gen, statut:r.statut, paye:Number(r.paye), metadata:r.metadata||{}, paiements:r.metadata?.paiements||[], datePaiement:r.metadata?.date_paiement||null };
}
function stockToDb(s){
  return { id:s.id, hotel_id:db.hotelId, designation:s.designation, categorie:s.categorie||null, unite:s.unite||null,
    quantite:s.quantite||0, seuil_alerte:s.seuilAlerte||null, prix_unitaire:s.prixUnitaire||null,
    date_peremption:s.datePeremption||null, date_entree:s.dateEntree||null };
}
function stockFromDb(r){
  return { id:r.id, designation:r.designation, categorie:r.categorie, unite:r.unite, quantite:Number(r.quantite),
    seuilAlerte:r.seuil_alerte, prixUnitaire:r.prix_unitaire, datePeremption:r.date_peremption, dateEntree:r.date_entree };
}
function mouvStockToDb(m){
  return { id:m.id, hotel_id:db.hotelId, date:m.date||null, article_id:m.articleId||null, type:m.type||null,
    quantite:m.quantite||0, motif:m.motif||null };
}
function mouvStockFromDb(r){
  return { id:r.id, date:r.date, articleId:r.article_id, type:r.type, quantite:Number(r.quantite), motif:r.motif };
}
function depenseToDb(d){
  return { id:d.id, hotel_id:db.hotelId, description:d.description, categorie:d.categorie||null,
    fournisseur:d.fournisseur||null, date:d.date||null, montant:d.montant||0, mode:d.mode||null, statut:d.statut||null };
}
function depenseFromDb(r){
  return { id:r.id, description:r.description, categorie:r.categorie, fournisseur:r.fournisseur, date:r.date,
    montant:Number(r.montant), mode:r.mode, statut:r.statut };
}
function caisseToDb(c){
  return { id:c.id, hotel_id:db.hotelId, date:c.date||null, ref:c.ref||null, description:c.description||null,
    type:c.type||null, mode:c.mode||null, montant:c.montant||0, session_id:c.sessionId||null };
}
function caisseFromDb(r){
  return { id:r.id, date:r.date, ref:r.ref, description:r.description, type:r.type, mode:r.mode, montant:Number(r.montant), sessionId:r.session_id };
}
function sessionCaisseToDb(s){
  return { id:s.id, hotel_id:db.hotelId, numero:s.numero||null, date_ouverture:s.dateOuverture||null,
    ouverture_par:s.ouverturePar||null, fond_initial:s.fondInitial??null, note_ouverture:s.noteOuverture||null,
    date_fermeture:s.dateFermeture||null, fermeture_par:s.fermeturePar||null, montant_compte:s.montantCompte??null,
    montant_attendu:s.montantAttendu??null, ecart:s.ecart??null, note_fermeture:s.noteFermeture||null, statut:s.statut };
}
function sessionCaisseFromDb(r){
  return { id:r.id, numero:r.numero, dateOuverture:r.date_ouverture, ouverturePar:r.ouverture_par,
    fondInitial:r.fond_initial, noteOuverture:r.note_ouverture, dateFermeture:r.date_fermeture,
    fermeturePar:r.fermeture_par, montantCompte:r.montant_compte, montantAttendu:r.montant_attendu,
    ecart:r.ecart, noteFermeture:r.note_fermeture, statut:r.statut };
}

// Récupère le profil (rôle, hôtel) juste après une connexion réussie
async function chargerSessionUtilisateur(userId, loginTape){
  const { data: profile, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if(error || !profile || profile.actif !== true) return false;
  db.hotelId = profile.hotel_id;
  if(profile.role==='Super Administrateur'){
    const{data:hotels,error:hotelError}=await sb.from('hotels').select('id,nom').order('nom').limit(500);
    if(hotelError||!hotels?.length)return false;
    const selected=hotels.find(h=>h.id===localStorage.getItem('soonre-hotel:'+profile.id))||hotels.find(h=>h.id===profile.hotel_id)||hotels[0];db.hotelId=selected.id;
    setTimeout(()=>mountHotelSelector(hotels,selected.id),0);
  }
  db.currentUser = { id:profile.id, login:loginTape||profile.nom, nom:profile.nom, role:profile.role, actif:profile.actif };
  return true;
}

// Charge Chambres/Clients/Réservations/Factures depuis Supabase (remplace le localStorage pour ces 4 collections)
async function chargerDonneesCoeur(){ return loadCloudState(); }

// Ré-écrit entièrement les 4 tables à partir de l'état actuel de db.* (upsert = crée ou met à jour)
async function syncCoeurVersSupabase(){ return queueCloudSync(); }

// Cache la partie du menu (et de Paramètres) que certains rôles ne doivent pas voir
function filtrerMenuParRole(){
  const role = db.currentUser?.role;

  document.querySelectorAll('.nav-item').forEach(item=>{ item.style.display=''; });
  const rolesRestreints = ['Ménage','Maintenance'];
  if(rolesRestreints.includes(role)){
    document.querySelectorAll('.nav-item').forEach(item=>{
      if(item.dataset.page !== 'chambres') item.style.display = 'none';
    });
    return;
  }

  // Seuls direction et gérance gèrent les comptes utilisateurs
  const rolesGestionComptes = ['Directeur Général','Gérant','Super Administrateur'];
  const ongletUsers = document.querySelector('[data-partab="users"]');
  if(ongletUsers) ongletUsers.style.display = rolesGestionComptes.includes(role) ? '' : 'none';
}

// ============ STORE ============
const STORE_KEY = 'raabo_amzara_v2';
const defaultConfig = {
  nom:'Hôtel Soonré',
  raison:'Centre Culturel RAABO AMZARA',
  slogan:'Hébergement • Restauration • Touristique • Manifestations événementielles',
  adresse:'',
  ville:'',
  tel:'',
  email:'',
  site:'',
  nif:'',
  rccm:'',
  agrement:'',
  bcb:'',
  tva:18,
  devise:'FCFA',
  seuilRemise:5 // jours pour tarif négociable
};

let db = {
  config: {...defaultConfig},
  users:[],
  chambres:[],
  clients:[],
  reservations:[],
  menu:[],
  commandes:[],
  tablesResto:[],           // plan de salle
  reservationsResto:[],     // réservations de tables
  formules:[],              // menus du jour / formules
  categoriesMenu:[],        // catégories personnalisables
  salles:[],
  evenements:[],
  factures:[],
  proformas:[],
  devis:[],
  caisse:[],
  depenses:[],
  personnel:[],
  magasins:[],
  locationsMagasin:[],
  pointages:[],
  permanences:[],
  paies:[],
  stock:[],
  mouvementsStock:[],
  sessionsCaisse:[],
  planComptable:[],
  ecritures:[],
  exercices:[],
  auditLog:[],         // journal d'audit & traçabilité
  currentUser:null
};

// Tarification officielle des chambres (montants par nuit, en FCFA).
const ROOM_TARIFF_VERSION = 2;
const ROOM_TARIFFS = {
  'Ventilée': 6000,
  'Climatisée': 12500,
  'VIP Ventilée': 8000,
  'VIP Climatisée': 15000,
  'Bungalow Ventilé': 8000
};
function applyOfficialRoomTariffs(){
  let changed = false;
  (db.chambres || []).forEach(chambre => {
    const tarif = ROOM_TARIFFS[chambre.type];
    if(tarif && chambre.prix !== tarif){
      chambre.prix = tarif;
      changed = true;
    }
  });
  db.tarificationVersion = ROOM_TARIFF_VERSION;
  return changed;
}

function loadDB(){
  // Migration : supprimer ancienne base v1 si présente
  // Keep legacy data intact until explicitly exported or migrated.
  const raw = localStorage.getItem(STORE_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      db = {...db,...parsed};
      db.config = {...defaultConfig,...(parsed.config||{})};
      db.users = []; // Authentication is exclusively managed by Supabase.
      // Garantir présence des nouvelles collections
      ['magasins','locationsMagasin','pointages','permanences','paies','stock','mouvementsStock','sessionsCaisse','ecritures','planComptable','exercices','auditLog','tablesResto','reservationsResto','formules','categoriesMenu','proformas','devis'].forEach(k=>{
        if(!db[k]) db[k] = [];
      });
      // Preserve tariffs configured by the hotel.
      persistLocal();
    }catch(e){console.error('DB load error',e)}
  } else {
    seedData();
    persistLocal();
  }
}
function saveDB(){
  persistLocal();
  if(sb && db.hotelId && db.currentUser && !recoveryBlocked)queueCloudSync();
}
function uid(prefix='id'){return prefix+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}


// ============ SEED ============
function seedData(){ db.tarificationVersion=ROOM_TARIFF_VERSION; }

// ============ UTILS ============
function fmt(n){
  if(n==null||isNaN(n))n=0;
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g,' ')+' '+db.config.devise;
}
function fmtNum(n){return (n||0).toLocaleString('fr-FR').replace(/,/g,' ')}
function fmtDate(d){
  if(!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('fr-FR');
}
function fmtDateTime(d){
  if(!d) return '-';
  return new Date(d).toLocaleString('fr-FR');
}
function toast(msg, type='success'){
  if(type==='success' && window.hotelSyncPending){msg += ' — sauvegarde serveur en attente';type='warning';}
  const t = document.createElement('div');
  t.className='toast '+type;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(20px)';t.style.transition='all 0.3s'},2600);
  setTimeout(()=>t.remove(),3000);
}
function confirmDialog(msg,cb){if(confirm(msg))cb()}

// ============ AUTH ============
function handleLogin(e){ e.preventDefault(); toast('Connexion sécurisée en cours de chargement','warning'); }
async function logout(){
 if(window.hotelSyncPending && !confirm('Des modifications ne sont pas encore sauvegardées sur le serveur. Se déconnecter et conserver leur copie locale ?'))return;
 await syncQueue.catch(()=>{});
 const oldHotel=db.hotelId;
 if(sb)await sb.auth.signOut();
 clearRecoveryAction();document.getElementById('syncStatus')?.remove();document.getElementById('activeHotel')?.remove();window.hotelSyncPending=false;recoveryBlocked=false;
 db.currentUser=null;db.hotelId=null;cloudReady=false;
 clearSensitiveState();persistLocal();
 document.getElementById('app').classList.remove('active');
 document.getElementById('loginScreen').style.display='flex';
}
function showApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('app').classList.add('active');
  document.getElementById('userName').textContent = db.currentUser.nom;
  document.getElementById('userRole').textContent = db.currentUser.role;
  document.getElementById('userAvatar').textContent = db.currentUser.nom[0].toUpperCase();
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  renderAll();
  if(['Ménage','Maintenance'].includes(db.currentUser.role))showPage('chambres');
}

// ============ NAVIGATION ============
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  const item = document.querySelector(`.nav-item[data-page="${name}"]`);
  if(item)item.classList.add('active');
  const titles = {
    dashboard:['Tableau de bord',"Vue d'ensemble de l'hôtel"],
    reservations:['Réservations','Gestion des séjours & réservations'],
    chambres:['Chambres','Plan et gestion des chambres'],
    clients:['Clients','Base de données clientèle'],
    restauration:['Restauration','Commandes, plan de salle, cuisine, menu, formules & statistiques'],
    salles:['Salles & Événements','Location de salles et événements'],
    factures:['Facturation','Toutes les factures'],
    caisse:['Caisse','Mouvements de caisse'],
    depenses:['Dépenses','Suivi des dépenses'],
    personnel:['Personnel','Gestion des ressources humaines'],
    magasins:['Magasins','Location des magasins & locaux commerciaux'],
    stock:['Stock','Inventaire, approvisionnement & alertes'],
    pointage:['Pointage & Permanences','Présence du personnel et planning de garde'],
    paie:['Paie & Bulletins','Gestion de la paie et bulletins de salaire'],
    rapports:['Rapports & Bilans','Analyses, bilans journalier, hebdomadaire, mensuel, annuel'],
    comptabilite:['Comptabilité SYSCOHADA','Plan comptable, journaux, grand livre, balance, résultat, bilan'],
    audit:['Audit & Traçabilité','Journal de toutes les actions - qui, quoi, quand, comment'],
    parametres:['Paramètres','Configuration du système']
  };
  const t = titles[name] || [name,''];
  document.getElementById('pageTitle').textContent = t[0];
  document.getElementById('pageBreadcrumb').textContent = t[1];
  if(window.innerWidth<=900) toggleSidebar(true);
  renderPage(name);
}
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>showPage(item.dataset.page));
});

function toggleSidebar(force){
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('overlayBackdrop');
  if(force===true){sb.classList.remove('open');bd.classList.remove('active');return}
  sb.classList.toggle('open');
  bd.classList.toggle('active');
}

// ============ RENDER PAGE ROUTER ============
function renderPage(name){
  switch(name){
    case 'dashboard': renderDashboard(); break;
    case 'reservations': renderReservations(); break;
    case 'chambres': renderRooms(); break;
    case 'clients': renderClients(); break;
    case 'restauration': initRestoPage(); break;
    case 'salles': renderEvenements(); renderSalles(); break;
    case 'factures': initFactPage(); break;
    case 'caisse': renderCaisse(); break;
    case 'depenses': renderDepenses(); break;
    case 'personnel': renderPersonnel(); break;
    case 'magasins': renderMagasins(); renderLocations(); break;
    case 'stock': renderStock(); break;
    case 'pointage': initPointagePage(); renderPointage(); renderPermanences(); break;
    case 'paie': initPaiePage(); renderPaie(); break;
    case 'rapports': renderRapports(); break;
    case 'comptabilite': initComptaPage(); break;
    case 'audit': renderAudit(); break;
    case 'parametres': renderConfig(); renderUsers(); break;
  }
}
function updateSyncStatus(){
 if(!db.currentUser)return;
 let status=document.getElementById('syncStatus');if(!status){status=document.createElement('button');status.id='syncStatus';status.className='btn btn-sm btn-ghost';status.setAttribute('aria-live','polite');status.onclick=()=>{if(window.hotelSyncPending)showRecoveryAction();else toast('Toutes les modifications sont sauvegardées sur le serveur');};document.querySelector('.topbar-right').prepend(status);}
 status.textContent=recoveryBlocked?'⚠ Sauvegarde à récupérer':!navigator.onLine?'Hors ligne':window.hotelSyncPending?'Sauvegarde en cours…':'✓ Sauvegardé';
}
function renderSetupStatus(){
 let card=document.getElementById('setupStatus');if(!isManager()){card?.remove();return;}
 const missing=[];
 if(!db.chambres.length)missing.push({label:'Ajouter les chambres et leurs tarifs',page:'chambres'});
 if(!db.config.adresse||!db.config.tel)missing.push({label:'Compléter les coordonnées de facturation',page:'parametres'});
 if(!missing.length){card?.remove();return;}
 if(!card){card=document.createElement('div');card.id='setupStatus';card.className='card';document.getElementById('page-dashboard').prepend(card);}
 card.replaceChildren();const title=document.createElement('strong');title.textContent='Mise en service à terminer';card.append(title);
 for(const item of missing){const button=document.createElement('button');button.className='btn btn-sm btn-ghost';button.textContent=item.label;button.onclick=()=>showPage(item.page);card.append(button);}
}
function renderAll(){
  renderDashboard();
}

// ============ DASHBOARD ============
let revenueChart, repartChart, occupChart;
function renderDashboard(){
  renderSetupStatus();updateSyncStatus();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(),now.getMonth(),1);
  const monthCA = db.factures
    .filter(f=>new Date(f.date)>=monthStart)
    .reduce((s,f)=>s+(f.paye||0),0);
  document.getElementById('kpiCA').textContent = fmt(monthCA);

  const totalRooms = db.chambres.length;
  const occupied = db.chambres.filter(c=>c.statut==='occupee').length;
  const tx = totalRooms ? Math.round(occupied/totalRooms*100) : 0;
  document.getElementById('kpiOccup').textContent = tx+'%';
  document.getElementById('kpiOccupSub').textContent = `${occupied} / ${totalRooms} chambres`;

  const activeRes = db.reservations.filter(r=>['confirmee','checkin'].includes(r.statut));
  const todayStr = now.toISOString().slice(0,10);
  const todayArrivals = db.reservations.filter(r=>r.arrivee===todayStr && r.statut!=='annulee').length;
  document.getElementById('kpiResa').textContent = activeRes.length;
  document.getElementById('kpiResaSub').textContent = `dont ${todayArrivals} aujourd'hui`;

  document.getElementById('kpiClients').textContent = db.clients.length;

  // Movements today
  const mv = [];
  db.reservations.filter(r=>r.arrivee===todayStr).forEach(r=>{
    const c = db.clients.find(x=>x.id===r.clientId);
    const ch = db.chambres.find(x=>x.id===r.chambreId);
    mv.push({type:'Arrivée',client:c?c.prenom+' '+c.nom:'-',chambre:ch?ch.numero:'-',heure:'14:00',statut:r.statut});
  });
  db.reservations.filter(r=>r.depart===todayStr).forEach(r=>{
    const c = db.clients.find(x=>x.id===r.clientId);
    const ch = db.chambres.find(x=>x.id===r.chambreId);
    mv.push({type:'Départ',client:c?c.prenom+' '+c.nom:'-',chambre:ch?ch.numero:'-',heure:'12:00',statut:r.statut});
  });
  const mvHtml = mv.length ? mv.map(m=>`
    <tr>
      <td><span class="badge ${escapeHtml(m.type==='Arrivée'?'badge-success':'badge-info')}">${escapeHtml(m.type)}</span></td>
      <td>${escapeHtml(m.client)}</td><td><strong>${escapeHtml(m.chambre)}</strong></td><td>${escapeHtml(m.heure)}</td>
      <td>${statutBadge(m.statut)}</td>
    </tr>`).join('') : `<tr><td colspan="5" class="empty">Aucun mouvement aujourd'hui</td></tr>`;
  document.getElementById('todayMovements').innerHTML = mvHtml;

  // Recent reservations
  const recent = [...db.reservations].sort((a,b)=>new Date(b.dateCreation||b.arrivee)-new Date(a.dateCreation||a.arrivee)).slice(0,6);
  document.getElementById('recentResa').innerHTML = recent.length ? recent.map(r=>{
    const c = db.clients.find(x=>x.id===r.clientId);
    const ch = db.chambres.find(x=>x.id===r.chambreId);
    return `<tr>
      <td><strong>${escapeHtml(r.ref)}</strong></td>
      <td>${escapeHtml(c?c.prenom+' '+c.nom:'-')}</td>
      <td>${escapeHtml(ch?ch.numero:'-')}</td>
      <td>${escapeHtml(fmtDate(r.arrivee))}</td>
      <td>${escapeHtml(fmt(r.montant))}</td>
      <td>${statutBadge(r.statut)}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" class="empty">Aucune réservation</td></tr>`;

  // Alerts
  const alerts = [];
  const impayes = db.factures.filter(f=>f.statut!=='paye').length;
  if(impayes) alerts.push({type:'warning',msg:`${impayes} facture(s) impayée(s) ou partielles`});
  const maint = db.chambres.filter(c=>c.statut==='maintenance').length;
  if(maint) alerts.push({type:'info',msg:`${maint} chambre(s) en maintenance`});
  const arrivees = db.reservations.filter(r=>r.arrivee===todayStr && r.statut==='confirmee').length;
  if(arrivees) alerts.push({type:'success',msg:`${arrivees} arrivée(s) prévue(s) aujourd'hui`});
  if(!alerts.length) alerts.push({type:'success',msg:'Tout est en ordre ✓'});
  document.getElementById('alertsList').innerHTML = alerts.map(a=>`
    <div style="padding:12px;border-radius:8px;margin-bottom:8px;background:var(--${escapeHtml(a.type)}-soft);border-left:3px solid var(--${escapeHtml(a.type)})">
      ${escapeHtml(a.msg)}
    </div>`).join('');

  renderRevenueChart();
  renderRepartChart();
  renderOccupChart();
}

function renderRevenueChart(){
  const ctx = document.getElementById('revenueChart');
  if(!ctx) return;
  const source = document.getElementById('chartSource')?.value || 'all';
  const now = new Date();
  const labels = [], data = [];
  for(let i=11;i>=0;i--){
    const d = new Date(now.getFullYear(),now.getMonth()-i,1);
    const dNext = new Date(now.getFullYear(),now.getMonth()-i+1,1);
    labels.push(d.toLocaleDateString('fr-FR',{month:'short'}));
    let sum = 0;
    db.factures.forEach(f=>{
      const dt = new Date(f.date);
      if(dt>=d && dt<dNext){
        if(source==='all' || f.type===source) sum += f.paye||0;
      }
    });
    data.push(sum);
  }
  if(revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type:'line',
    data:{labels,datasets:[{
      label:'CA',data,
      borderColor:'#C99A4A',
      backgroundColor:'rgba(212,160,23,0.15)',
      fill:true,tension:0.35,
      pointBackgroundColor:'#0E2636',
      pointRadius:4
    }]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{ticks:{callback:v=>fmtNum(v)}}}
    }
  });
}
function renderRepartChart(){
  const ctx = document.getElementById('repartChart');
  if(!ctx) return;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(),now.getMonth(),1);
  const cats = {hebergement:0,restauration:0,salle:0,mixte:0};
  db.factures.filter(f=>new Date(f.date)>=monthStart).forEach(f=>{
    cats[f.type] = (cats[f.type]||0) + (f.paye||0);
  });
  if(repartChart) repartChart.destroy();
  repartChart = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Hébergement','Restauration','Salles','Mixte'],
      datasets:[{
        data:[cats.hebergement,cats.restauration,cats.salle,cats.mixte],
        backgroundColor:['#0E2636','#C99A4A','#23715F','#4B8992']
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}}
    }
  });
}
function renderOccupChart(){
  const ctx = document.getElementById('occupChart');
  if(!ctx) return;
  const stats = {libre:0,occupee:0,reservee:0,maintenance:0};
  db.chambres.forEach(c=>stats[c.statut]=(stats[c.statut]||0)+1);
  if(occupChart) occupChart.destroy();
  occupChart = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Libres','Occupées','Réservées','Maintenance'],
      datasets:[{
        data:[stats.libre,stats.occupee,stats.reservee,stats.maintenance],
        backgroundColor:['#1F7A3A','#B23A3A','#2B6CB0','#B8860B']
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}}
    }
  });
  document.getElementById('occupStats').innerHTML = `
    <div class="stat-row"><span class="label"><span class="status-dot" style="background:#1F7A3A"></span>Libres</span><span class="value">${escapeHtml(stats.libre)}</span></div>
    <div class="stat-row"><span class="label"><span class="status-dot" style="background:#B23A3A"></span>Occupées</span><span class="value">${escapeHtml(stats.occupee)}</span></div>
    <div class="stat-row"><span class="label"><span class="status-dot" style="background:#2B6CB0"></span>Réservées</span><span class="value">${escapeHtml(stats.reservee)}</span></div>
    <div class="stat-row"><span class="label"><span class="status-dot" style="background:#B8860B"></span>Maintenance</span><span class="value">${escapeHtml(stats.maintenance)}</span></div>
  `;
}

function statutBadge(s){
  const map = {
    confirmee:['badge-info','Confirmée'],
    checkin:['badge-success','Check-in'],
    checkout:['badge-neutral','Check-out'],
    annulee:['badge-danger','Annulée'],
    paye:['badge-success','Payée'],
    partiel:['badge-warning','Partielle'],
    impaye:['badge-danger','Impayée'],
    libre:['badge-success','Libre'],
    occupee:['badge-danger','Occupée'],
    reservee:['badge-info','Réservée'],
    maintenance:['badge-warning','Maintenance'],
    en_cours:['badge-warning','En cours'],
    servi:['badge-info','Servi'],
    actif:['badge-success','Actif'],
    inactif:['badge-neutral','Inactif']
  };
  const v = map[s] || ['badge-neutral',s||'-'];
  return `<span class="badge ${escapeHtml(v[0])}">${escapeHtml(v[1])}</span>`;
}

// ============ RESERVATIONS ============
function renderReservations(){
  const q = (document.getElementById('resaSearch')?.value||'').toLowerCase();
  const st = document.getElementById('resaStatus')?.value||'';
  const from = document.getElementById('resaFrom')?.value;
  const to = document.getElementById('resaTo')?.value;
  let list = [...db.reservations].sort((a,b)=>new Date(b.arrivee)-new Date(a.arrivee));
  list = list.filter(r=>{
    const c = db.clients.find(x=>x.id===r.clientId);
    const ch = db.chambres.find(x=>x.id===r.chambreId);
    if(q){
      const s = (r.ref+' '+(c?c.nom+' '+c.prenom:'')+' '+(ch?ch.numero:'')).toLowerCase();
      if(!s.includes(q)) return false;
    }
    if(st && r.statut!==st) return false;
    if(from && r.arrivee<from) return false;
    if(to && r.arrivee>to) return false;
    return true;
  });
  const tbody = document.getElementById('resaTable');
  tbody.innerHTML = list.length ? list.map(r=>{
    const c = db.clients.find(x=>x.id===r.clientId);
    const ch = db.chambres.find(x=>x.id===r.chambreId);
    return `<tr>
      <td><strong>${escapeHtml(r.ref)}</strong></td>
      <td>${escapeHtml(c?c.prenom+' '+c.nom:'-')}</td>
      <td>${escapeHtml(ch?ch.numero+' ('+ch.type+')':'-')}</td>
      <td>${escapeHtml(fmtDate(r.arrivee))}</td>
      <td>${escapeHtml(fmtDate(r.depart))}</td>
      <td>${escapeHtml(r.nuits)}</td>
      <td>${escapeHtml(fmt(r.montant))}</td>
      <td>${escapeHtml(fmt(r.paye))}</td>
      <td>${statutBadge(r.statut)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="viewResa('${escapeInline(r.id)}')">👁</button>
        <button class="btn btn-sm btn-ghost" onclick="editResa('${escapeInline(r.id)}')">✎</button>
        ${r.statut==='confirmee'?`<button class="btn btn-sm btn-green" onclick="checkinResa('${escapeInline(r.id)}')">Check-in</button>`:''}
        ${r.statut==='checkin'?`<button class="btn btn-sm btn-gold" onclick="checkoutResa('${escapeInline(r.id)}')">Check-out</button>`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteResa('${escapeInline(r.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="10" class="empty">Aucune réservation</td></tr>`;
}

function openResaModal(id){
  const r = id ? db.reservations.find(x=>x.id===id) : null;
  const clientsOpt = db.clients.map(c=>`<option value="${escapeHtml(c.id)}" ${escapeHtml(r&&r.clientId===c.id?'selected':'')}>${escapeHtml(c.prenom)} ${escapeHtml(c.nom)} — ${escapeHtml(c.tel)}</option>`).join('');
  const chambresOpt = db.chambres.filter(c=>c.statut==='libre'||c.statut==='reservee'||(r&&c.id===r.chambreId)).map(c=>`<option value="${escapeHtml(c.id)}" data-prix="${escapeHtml(c.prix)}" ${escapeHtml(r&&r.chambreId===c.id?'selected':'')}>${escapeHtml(c.numero)} — ${escapeHtml(c.type)} (${escapeHtml(fmt(c.prix))}/nuit)</option>`).join('');
  openModal(id?'Modifier réservation':'Nouvelle réservation', `
    <form id="resaForm" onsubmit="saveResa(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full">
          <label>Client *</label>
          <select class="form-control" id="rClient" required>
            <option value="">-- Choisir --</option>${clientsOpt}
          </select>
        </div>
        <div class="form-group full">
          <label>Chambre *</label>
          <select class="form-control" id="rChambre" required onchange="calcResaTotal()">
            <option value="">-- Choisir --</option>${chambresOpt}
          </select>
        </div>
        <div class="form-group">
          <label>Arrivée *</label>
          <input type="date" class="form-control" id="rArrivee" required value="${escapeHtml(r?r.arrivee:new Date().toISOString().slice(0,10))}" onchange="calcResaTotal()">
        </div>
        <div class="form-group">
          <label>Départ *</label>
          <input type="date" class="form-control" id="rDepart" required value="${escapeHtml(r?r.depart:'')}" onchange="calcResaTotal()">
        </div>
        <div class="form-group">
          <label>Montant total (auto)</label>
          <input type="number" class="form-control" id="rMontant" value="${escapeHtml(r?r.montant:0)}" readonly style="background:var(--cream)">
        </div>
        <div class="form-group">
          <label>Déjà encaissé (via la facture)</label>
          <input type="number" class="form-control" id="rPaye" value="${escapeHtml(r?r.paye:0)}" min="0" readonly><small>Enregistrez le séjour, puis utilisez « Facturer le séjour » pour encaisser un acompte.</small>
        </div>
        <div class="form-group">
          <label>Statut</label>
          <select class="form-control" id="rStatut">
            <option value="confirmee" ${escapeHtml(r&&r.statut==='confirmee'?'selected':'')}>Confirmée</option>
            <option value="checkin" ${escapeHtml(r&&r.statut==='checkin'?'selected':'')}>Check-in</option>
            <option value="checkout" ${escapeHtml(r&&r.statut==='checkout'?'selected':'')}>Check-out</option>
            <option value="annulee" ${escapeHtml(r&&r.statut==='annulee'?'selected':'')}>Annulée</option>
          </select>
        </div>
        <div class="form-group full">
          <label>Notes</label>
          <textarea class="form-control" id="rNote">${escapeHtml(r?r.note||'':'')}</textarea>
        </div>
      </div>
    </form>
  `,`
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="document.getElementById('resaForm').requestSubmit()">💾 Enregistrer</button>
  `);
}
function calcResaTotal(){
  const chSel = document.getElementById('rChambre');
  const prix = parseFloat(chSel.options[chSel.selectedIndex]?.dataset.prix||0);
  const a = document.getElementById('rArrivee').value;
  const d = document.getElementById('rDepart').value;
  if(!a||!d||!prix) return;
  const nuits = Math.round((new Date(d)-new Date(a))/86400000);
  if(nuits>0) document.getElementById('rMontant').value = nuits*prix;
}
function saveResa(e,id){
  e.preventDefault();
  const clientId = document.getElementById('rClient').value;
  const chambreId = document.getElementById('rChambre').value;
  const arrivee = document.getElementById('rArrivee').value;
  const depart = document.getElementById('rDepart').value;
  const montant = parseFloat(document.getElementById('rMontant').value)||0;
  const paye = parseFloat(document.getElementById('rPaye').value)||0;
  const statut = document.getElementById('rStatut').value;
  const note = document.getElementById('rNote').value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(arrivee)||!/^\d{4}-\d{2}-\d{2}$/.test(depart)||new Date(depart)<=new Date(arrivee)){toast('La date de départ doit être postérieure','error');return}
  const chTarif=db.chambres.find(c=>c.id===chambreId);
  if(!chTarif || !db.clients.some(c=>c.id===clientId)){toast('Client ou chambre invalide','error');return;}
  const nuits = Math.round((new Date(depart)-new Date(arrivee))/86400000);
  if(!Number.isFinite(montant)||!Number.isFinite(paye)||montant<0||paye<0||paye>montant){toast('Montants invalides','error');return;}
  if(['confirmee','checkin'].includes(statut) && db.reservations.some(r=>r.id!==id&&r.chambreId===chambreId&&['confirmee','checkin'].includes(r.statut)&&r.arrivee<depart&&r.depart>arrivee)){toast('Cette chambre est déjà réservée sur ces dates','error');return;}
  const existing=id?db.reservations.find(r=>r.id===id):null;
  if(paye!==(existing?.paye||0)){toast('Utilisez la facture pour enregistrer un paiement','warning');return;}
  if(existing&&db.factures.some(f=>f.refResa===id)&&(['clientId','chambreId','arrivee','depart','montant'].some(k=>existing[k]!==({clientId,chambreId,arrivee,depart,montant})[k])||statut==='annulee')){toast('Séjour facturé : dates, chambre et montant verrouillés','warning');return;}
  const oldRoom=id?db.reservations.find(r=>r.id===id)?.chambreId:null;
  if(id){
    const r = db.reservations.find(x=>x.id===id);
    if(!r){toast('Réservation introuvable','error');return;}
    Object.assign(r,{clientId,chambreId,arrivee,depart,nuits,montant,paye,statut,note});
  } else {
    db.reservations.push({
      id:uid('rs'),ref:'RES-'+uid('ref').slice(4).toUpperCase(),
      clientId,chambreId,arrivee,depart,nuits,montant,paye,statut,note,
      dateCreation:new Date().toISOString()
    });
  }
  if(oldRoom && oldRoom!==chambreId) refreshRoomStatus(oldRoom);
  refreshRoomStatus(chambreId);
  saveDB();
  closeModal();
  renderReservations();
  toast(id?'Réservation mise à jour':'Réservation créée');
}
function viewResa(id){
  const r = db.reservations.find(x=>x.id===id);
  const c = db.clients.find(x=>x.id===r.clientId);
  const ch = db.chambres.find(x=>x.id===r.chambreId);
  openModal('Détail réservation '+r.ref,`
    <div class="form-grid">
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">CLIENT</h5><div style="font-weight:600">${escapeHtml(c?c.prenom+' '+c.nom:'-')}</div><div>${escapeHtml(c?c.tel:'')}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">CHAMBRE</h5><div style="font-weight:600">N° ${escapeHtml(ch?ch.numero:'-')} (${escapeHtml(ch?ch.type:'')})</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">ARRIVÉE</h5><div>${escapeHtml(fmtDate(r.arrivee))}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">DÉPART</h5><div>${escapeHtml(fmtDate(r.depart))}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">NUITS</h5><div>${escapeHtml(r.nuits)}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">STATUT</h5><div>${statutBadge(r.statut)}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">MONTANT TOTAL</h5><div style="font-weight:700;font-size:16px;color:var(--brown-dark)">${escapeHtml(fmt(r.montant))}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px;margin-bottom:4px">PAYÉ / RESTE</h5><div>${escapeHtml(fmt(r.paye))} / <span style="color:var(--danger)">${escapeHtml(fmt(r.montant-r.paye))}</span></div></div>
    </div>
    ${r.note?`<div style="margin-top:14px"><h5 style="color:var(--muted);font-size:11px">NOTES</h5><div>${escapeHtml(r.note)}</div></div>`:''}
  `,`<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>${r.statut!=='annulee'?`<button class="btn btn-gold" onclick="facturerSejour('${escapeInline(r.id)}')">Facturer le séjour</button>`:''}`);
}
async function safeQuery(query){try{return await query;}catch{return {data:null,error:{message:'Connexion interrompue. Réessayez après le retour du réseau.'}};}}
async function callServerRPC(name,args){
 try{return await sb.rpc(name,args);}catch(error){return {data:null,error:{message:'Connexion interrompue. Vérifiez le réseau et réessayez.'}};}
}
async function facturerSejour(id){
 if(!cloudReady||recoveryBlocked){toast('Connectez-vous au serveur avant de facturer','warning');return;}
 await queueCloudSync();if(window.hotelSyncPending)return;
 const {data,error}=await callServerRPC('facturer_reservation',{p_id:id,p_tva:Number(db.config.tva)});
 if(error){toast('Facturation impossible : '+error.message,'danger');return;}
 try{await loadCloudState();renderReservations();renderFactures();viewFacture(data);}catch(error){toast('Facture créée ; rechargez les données : '+error.message,'warning');}
}
function editResa(id){openResaModal(id)}
function deleteResa(id){
 if(!requireManager())return;
 if(db.factures.some(f=>f.refResa===id)){toast('Cette réservation est facturée','warning');return;}
 confirmDialog('Supprimer cette réservation ?',()=>{
  const old=db.reservations.find(r=>r.id===id);
  db.reservations=db.reservations.filter(r=>r.id!==id);
  if(old)refreshRoomStatus(old.chambreId);
  saveDB();renderReservations();toast('Suppression en attente de synchronisation','warning');
 });
}
function checkinResa(id){
 const r=db.reservations.find(x=>x.id===id);
 if(!r||r.statut!=='confirmee')return;
 if(db.reservations.some(x=>x.id!==id&&x.chambreId===r.chambreId&&x.statut==='checkin')){toast('Chambre déjà occupée','error');return;}
 r.statut='checkin';refreshRoomStatus(r.chambreId);saveDB();renderReservations();toast('Check-in enregistré');
}
function checkoutResa(id){
 const r=db.reservations.find(x=>x.id===id);
 if(!r||r.statut!=='checkin')return;
 r.statut='checkout';refreshRoomStatus(r.chambreId);saveDB();renderReservations();toast('Check-out enregistré');
}

// ============ CHAMBRES ============
let roomView = 'grid';
function switchRoomView(){
  roomView = roomView==='grid'?'table':'grid';
  document.getElementById('roomsGridView').style.display = roomView==='grid'?'block':'none';
  document.getElementById('roomsTableView').style.display = roomView==='table'?'block':'none';
  renderRooms();
}
function renderRooms(){
  const st = document.getElementById('roomFilter')?.value||'';
  const tp = document.getElementById('roomTypeFilter')?.value||'';
  const bl = document.getElementById('roomBlocFilter')?.value||'';
  let list = db.chambres.filter(c=>{
    if(st && c.statut!==st) return false;
    if(tp && c.type!==tp) return false;
    if(bl && c.bloc!==bl) return false;
    return true;
  }).sort((a,b)=>(a.numero||'').localeCompare(b.numero||''));

  if(roomView==='grid'){
    document.getElementById('roomsGrid').innerHTML = list.length ? list.map(c=>`
      <div class="room-card ${escapeHtml(c.statut)}" onclick="viewRoom('${escapeInline(c.id)}')">
        <div class="room-status">${escapeHtml(c.statut)}</div>
        <div class="room-num">${escapeHtml(c.numero)}</div>
        <div class="room-type">${escapeHtml(c.type)}${escapeHtml(c.eauChaude?' 🔥':'')}</div>
        <div style="font-size:10px;color:var(--muted);margin:4px 0">${escapeHtml((c.bloc||'').split('—')[1]||'')}</div>
        <div class="room-price">${escapeHtml(fmt(c.prix))}</div>
      </div>
    `).join('') : `<div class="empty" style="grid-column:1/-1"><div class="icon">🛏️</div>Aucune chambre</div>`;
  } else {
    document.getElementById('roomsTable').innerHTML = list.length ? list.map(c=>`
      <tr>
        <td><strong>${escapeHtml(c.numero)}</strong></td><td>${escapeHtml(c.type)}${escapeHtml(c.eauChaude?' 🔥':'')}</td>
        <td>${escapeHtml((c.bloc||'').split('—')[0]||'')}</td>
        <td>${escapeHtml(c.capacite)} pers.</td><td>${escapeHtml(fmt(c.prix))}</td>
        <td>${statutBadge(c.statut)}</td>
        <td>
          <button class="btn btn-sm btn-ghost" onclick="editRoom('${escapeInline(c.id)}')">✎</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRoom('${escapeInline(c.id)}')">×</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7" class="empty">Aucune chambre</td></tr>`;
  }
}
function openRoomModal(id){
  const r = id ? db.chambres.find(x=>x.id===id) : null;
  openModal(id?'Modifier chambre':'Nouvelle chambre',`
    <form id="roomForm" onsubmit="saveRoom(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Numéro *</label><input type="text" class="form-control" id="chNum" required value="${escapeHtml(r?r.numero:'')}"></div>
        <div class="form-group"><label>Type *</label>
          <select class="form-control" id="chType" required>
            ${['Ventilée','Climatisée','VIP Ventilée','VIP Climatisée','Bungalow Ventilé'].map(t=>`<option ${escapeHtml(r&&r.type===t?'selected':'')}>${escapeHtml(t)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Bloc</label>
          <select class="form-control" id="chBloc">
            ${['Bloc 01 — MONUC / RDC','Bloc 02 — ONUCI / RCI','Bloc 03 — AES / VIP CEDEAO','Bloc 04 — Bungalows'].map(b=>`<option ${escapeHtml(r&&r.bloc===b?'selected':'')}>${escapeHtml(b)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Eau chaude</label>
          <select class="form-control" id="chEauChaude">
            <option value="false" ${escapeHtml(r&&!r.eauChaude?'selected':'')}>Non</option>
            <option value="true" ${escapeHtml(r&&r.eauChaude?'selected':'')}>Oui</option>
          </select>
        </div>
        <div class="form-group"><label>Étage (0 = rez-de-chaussée)</label><input type="number" class="form-control" id="chEtage" required value="${escapeHtml(r?r.etage??0:0)}" min="-5" max="200"></div>
        <div class="form-group"><label>Capacité</label><input type="number" class="form-control" id="chCap" value="${escapeHtml(r?r.capacite:2)}" min="1"></div>
        <div class="form-group"><label>Prix / nuit (FCFA) *</label><input type="number" class="form-control" id="chPrix" required value="${escapeHtml(r?r.prix:25000)}" min="0"></div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="chStatut">
            <option value="libre" ${escapeHtml(r&&r.statut==='libre'?'selected':'')}>Libre</option>
            <option value="occupee" ${escapeHtml(r&&r.statut==='occupee'?'selected':'')}>Occupée</option>
            <option value="reservee" ${escapeHtml(r&&r.statut==='reservee'?'selected':'')}>Réservée</option>
            <option value="maintenance" ${escapeHtml(r&&r.statut==='maintenance'?'selected':'')}>Maintenance</option>
          </select>
        </div>
        <div class="form-group full"><label>Équipements</label><textarea class="form-control" id="chEquip">${escapeHtml(r?r.equipements||'':'')}</textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('roomForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveRoom(e,id){
  e.preventDefault();
  const data = {
    numero:document.getElementById('chNum').value,
    type:document.getElementById('chType').value,
    bloc:document.getElementById('chBloc').value,
    eauChaude:document.getElementById('chEauChaude').value==='true',
    climatisee:document.getElementById('chType').value.includes('Climatisée'),
    etage:parseInt(document.getElementById('chEtage').value),
    capacite:parseInt(document.getElementById('chCap').value)||1,
    prix:parseFloat(document.getElementById('chPrix').value)||0,
    statut:document.getElementById('chStatut').value,
    equipements:document.getElementById('chEquip').value
  };
  data.numero=data.numero.trim();
  if(!data.numero||!Number.isFinite(data.prix)||data.prix<0||!Number.isInteger(data.etage)||data.capacite<1||db.chambres.some(c=>c.id!==id&&c.numero.trim().toLowerCase()===data.numero.toLowerCase())){toast('Numéro déjà utilisé ou caractéristiques invalides','warning');return;}
  if(id) Object.assign(db.chambres.find(x=>x.id===id),data);
  else db.chambres.push({id:uid('rm'),...data});
  saveDB();closeModal();renderRooms();toast('Enregistré');
}
function viewRoom(id){
  const c = db.chambres.find(x=>x.id===id);
  openModal(`Chambre ${c.numero}`,`
    <div class="form-grid">
      <div><h5 style="color:var(--muted);font-size:11px">TYPE</h5><div style="font-weight:600">${escapeHtml(c.type)}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px">STATUT</h5><div>${statutBadge(c.statut)}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px">ÉTAGE</h5><div>${escapeHtml(c.etage)}</div></div>
      <div><h5 style="color:var(--muted);font-size:11px">CAPACITÉ</h5><div>${escapeHtml(c.capacite)} personnes</div></div>
      <div><h5 style="color:var(--muted);font-size:11px">PRIX / NUIT</h5><div style="font-weight:700;font-size:16px;color:var(--brown-dark)">${escapeHtml(fmt(c.prix))}</div></div>
    </div>
    ${c.equipements?`<div style="margin-top:14px"><h5 style="color:var(--muted);font-size:11px">ÉQUIPEMENTS</h5><div>${escapeHtml(c.equipements)}</div></div>`:''}
  `,`
    <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    <button class="btn btn-primary" onclick="editRoom('${escapeInline(c.id)}')">✎ Modifier</button>
  `);
}
function editRoom(id){openRoomModal(id)}
function deleteRoom(id){
  confirmDialog('Supprimer cette chambre ?',()=>{
    db.chambres = db.chambres.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB();renderRooms();toast('Supprimée');
  });
}

// ============ CLIENTS ============
function renderClients(){
  const q = (document.getElementById('clientSearch')?.value||'').toLowerCase();
  const t = document.getElementById('clientType')?.value||'';
  let list = db.clients.filter(c=>{
    if(t && c.type!==t) return false;
    if(q){
      const s = (c.nom+' '+c.prenom+' '+c.tel+' '+c.email).toLowerCase();
      if(!s.includes(q)) return false;
    }
    return true;
  });
  document.getElementById('clientsTable').innerHTML = list.length ? list.map(c=>{
    const sejours = db.reservations.filter(r=>r.clientId===c.id).length;
    const total = db.factures.filter(f=>f.clientId===c.id).reduce((s,f)=>s+(f.paye||0),0);
    return `<tr>
      <td><strong>${escapeHtml(c.prenom)} ${escapeHtml(c.nom)}</strong></td>
      <td>${statutBadge(c.type==='VIP'?'':'')}<span class="badge ${escapeHtml(c.type==='VIP'?'badge-gold':(c.type==='Entreprise'?'badge-info':'badge-neutral'))}">${escapeHtml(c.type)}</span></td>
      <td>${escapeHtml(c.tel)}</td><td>${escapeHtml(c.email)}</td><td>${escapeHtml(c.ville||'-')}</td>
      <td>${escapeHtml(sejours)}</td><td>${escapeHtml(fmt(total))}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editClient('${escapeInline(c.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${escapeInline(c.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="8" class="empty">Aucun client</td></tr>`;
}
function openClientModal(id){
  const c = id ? db.clients.find(x=>x.id===id) : null;
  openModal(id?'Modifier client':'Nouveau client',`
    <form id="clForm" onsubmit="saveClient(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Nom *</label><input class="form-control" id="clNom" required value="${escapeHtml(c?c.nom:'')}"></div>
        <div class="form-group"><label>Prénom *</label><input class="form-control" id="clPrenom" required value="${escapeHtml(c?c.prenom:'')}"></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="clType">
            ${['Particulier','Entreprise','VIP'].map(t=>`<option ${escapeHtml(c&&c.type===t?'selected':'')}>${escapeHtml(t)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Téléphone *</label><input class="form-control" id="clTel" required value="${escapeHtml(c?c.tel:'')}"></div>
        <div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="${escapeHtml(c?c.email||'':'')}"></div>
        <div class="form-group"><label>Ville</label><input class="form-control" id="clVille" value="${escapeHtml(c?c.ville||'':'Ouagadougou')}"></div>
        <div class="form-group"><label>Pays</label><input class="form-control" id="clPays" value="${escapeHtml(c?c.pays||'':'Burkina Faso')}"></div>
        <div class="form-group"><label>Type pièce</label>
          <select class="form-control" id="clPiece">
            ${['CNIB','Passeport','Permis'].map(p=>`<option ${escapeHtml(c&&c.piece===p?'selected':'')}>${escapeHtml(p)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full"><label>N° Pièce</label><input class="form-control" id="clNumPiece" value="${escapeHtml(c?c.numPiece||'':'')}"></div>
        <div class="form-group full"><label>Note</label><textarea class="form-control" id="clNote">${escapeHtml(c?c.note||'':'')}</textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('clForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveClient(e,id){
  e.preventDefault();
  const data = {
    nom:document.getElementById('clNom').value,
    prenom:document.getElementById('clPrenom').value,
    type:document.getElementById('clType').value,
    tel:document.getElementById('clTel').value,
    email:document.getElementById('clEmail').value,
    ville:document.getElementById('clVille').value,
    pays:document.getElementById('clPays').value,
    piece:document.getElementById('clPiece').value,
    numPiece:document.getElementById('clNumPiece').value,
    note:document.getElementById('clNote').value
  };
  if(id) Object.assign(db.clients.find(x=>x.id===id),data);
  else db.clients.push({id:uid('cl'),...data});
  saveDB();closeModal();renderClients();toast('Enregistré');
}
function editClient(id){openClientModal(id)}
function deleteClient(id){
  confirmDialog('Supprimer ce client ?',()=>{
    db.clients = db.clients.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB();renderClients();toast('Supprimé');
  });
}

// ============ RESTAURATION ============

// [Anciennes fonctions restaurant supprimées — remplacées par module enrichi ci-dessous]


// ============ SALLES / EVENEMENTS ============
function switchSalleTab(tab){
  document.querySelectorAll('[data-salletab]').forEach(t=>t.classList.remove('active'));
  document.querySelector(`[data-salletab="${tab}"]`).classList.add('active');
  document.getElementById('salles-reservations').style.display = tab==='reservations'?'block':'none';
  document.getElementById('salles-salles').style.display = tab==='salles'?'block':'none';
}
function renderSalles(){
  document.getElementById('sallesTable').innerHTML = db.salles.length ? db.salles.map(s=>`
    <tr>
      <td><strong>${escapeHtml(s.nom)}</strong></td>
      <td>${escapeHtml(s.capacite)} personnes</td>
      <td>${escapeHtml(s.equipements)}</td>
      <td>${escapeHtml(fmt(s.tarif))}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editSalle('${escapeInline(s.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSalle('${escapeInline(s.id)}')">×</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="5" class="empty">Aucune salle</td></tr>`;
}
function openSalleModal(id){
  const s = id ? db.salles.find(x=>x.id===id) : null;
  openModal(id?'Modifier salle':'Nouvelle salle',`
    <form id="slForm" onsubmit="saveSalle(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Nom *</label><input class="form-control" id="slNom" required value="${escapeHtml(s?s.nom:'')}"></div>
        <div class="form-group"><label>Capacité *</label><input type="number" class="form-control" id="slCap" required value="${escapeHtml(s?s.capacite:50)}" min="1"></div>
        <div class="form-group"><label>Tarif/jour *</label><input type="number" class="form-control" id="slTarif" required value="${escapeHtml(s?s.tarif:75000)}" min="0"></div>
        <div class="form-group full"><label>Équipements</label><textarea class="form-control" id="slEquip">${escapeHtml(s?s.equipements||'':'')}</textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('slForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveSalle(e,id){
  e.preventDefault();
  const data = {
    nom:document.getElementById('slNom').value,
    capacite:parseInt(document.getElementById('slCap').value)||1,
    tarif:parseFloat(document.getElementById('slTarif').value)||0,
    equipements:document.getElementById('slEquip').value
  };
  if(id) Object.assign(db.salles.find(x=>x.id===id),data);
  else db.salles.push({id:uid('sl'),...data});
  saveDB();closeModal();renderSalles();toast('Enregistré');
}
function editSalle(id){openSalleModal(id)}
function deleteSalle(id){
  confirmDialog('Supprimer ?',()=>{db.salles=db.salles.filter(x=>x.id!==id);saveDB();renderSalles();toast('Supprimé')});
}

function renderEvenements(){
  const q = (document.getElementById('evtSearch')?.value||'').toLowerCase();
  let list = [...db.evenements].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(q) list = list.filter(e=>(e.nom+' '+(e.clientNom||'')).toLowerCase().includes(q));
  document.getElementById('evtTable').innerHTML = list.length ? list.map(e=>{
    const s = db.salles.find(x=>x.id===e.salleId);
    const cl = db.clients.find(x=>x.id===e.clientId);
    return `<tr>
      <td><strong>${escapeHtml(e.ref)}</strong></td>
      <td>${escapeHtml(e.nom)}</td>
      <td>${escapeHtml(cl?cl.prenom+' '+cl.nom:e.clientNom||'-')}</td>
      <td>${escapeHtml(s?s.nom:'-')}</td>
      <td>${escapeHtml(fmtDate(e.date))}</td>
      <td>${escapeHtml(e.participants)}</td>
      <td>${escapeHtml(fmt(e.montant))}</td>
      <td>${statutBadge(e.statut)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editEvt('${escapeInline(e.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEvt('${escapeInline(e.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" class="empty">Aucun événement</td></tr>`;
}
function openEvtModal(id){
  const e = id ? db.evenements.find(x=>x.id===id) : null;
  const clOpt = db.clients.map(c=>`<option value="${escapeHtml(c.id)}" ${escapeHtml(e&&e.clientId===c.id?'selected':'')}>${escapeHtml(c.prenom)} ${escapeHtml(c.nom)}</option>`).join('');
  const slOpt = db.salles.map(s=>`<option value="${escapeHtml(s.id)}" data-tarif="${escapeHtml(s.tarif)}" ${escapeHtml(e&&e.salleId===s.id?'selected':'')}>${escapeHtml(s.nom)} — ${escapeHtml(fmt(s.tarif))}</option>`).join('');
  openModal(id?'Modifier événement':'Nouvel événement',`
    <form id="evtForm" onsubmit="saveEvt(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Nom de l'événement *</label><input class="form-control" id="evNom" required value="${escapeHtml(e?e.nom:'')}"></div>
        <div class="form-group"><label>Client *</label>
          <select class="form-control" id="evClient" required><option value="">--</option>${clOpt}</select>
        </div>
        <div class="form-group"><label>Salle *</label>
          <select class="form-control" id="evSalle" required onchange="document.getElementById('evMontant').value=this.options[this.selectedIndex].dataset.tarif||0">
            <option value="">--</option>${slOpt}
          </select>
        </div>
        <div class="form-group"><label>Date *</label><input type="date" class="form-control" id="evDate" required value="${escapeHtml(e?e.date:'')}"></div>
        <div class="form-group"><label>Participants</label><input type="number" class="form-control" id="evPart" value="${escapeHtml(e?e.participants:0)}" min="0"></div>
        <div class="form-group"><label>Montant (FCFA)</label><input type="number" class="form-control" id="evMontant" value="${escapeHtml(e?e.montant:0)}" min="0"></div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="evStatut">
            <option value="confirmee" ${escapeHtml(e&&e.statut==='confirmee'?'selected':'')}>Confirmée</option>
            <option value="realise" ${escapeHtml(e&&e.statut==='realise'?'selected':'')}>Réalisé</option>
            <option value="annulee" ${escapeHtml(e&&e.statut==='annulee'?'selected':'')}>Annulée</option>
          </select>
        </div>
        <div class="form-group full"><label>Note</label><textarea class="form-control" id="evNote">${escapeHtml(e?e.note||'':'')}</textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('evtForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveEvt(e,id){
  e.preventDefault();
  const data = {
    nom:document.getElementById('evNom').value,
    clientId:document.getElementById('evClient').value,
    salleId:document.getElementById('evSalle').value,
    date:document.getElementById('evDate').value,
    participants:parseInt(document.getElementById('evPart').value)||0,
    montant:parseFloat(document.getElementById('evMontant').value)||0,
    statut:document.getElementById('evStatut').value,
    note:document.getElementById('evNote').value
  };
  if(id) Object.assign(db.evenements.find(x=>x.id===id),data);
  else db.evenements.push({id:uid('ev'),ref:'EVT-'+(6000+db.evenements.length),...data});
  saveDB();closeModal();renderEvenements();toast('Enregistré');
}
function editEvt(id){openEvtModal(id)}
function deleteEvt(id){
  confirmDialog('Supprimer ?',()=>{db.evenements=db.evenements.filter(x=>x.id!==id);saveDB();renderEvenements();toast('Supprimé')});
}

// ============ FACTURES ============
function renderFactures(){
  const q = (document.getElementById('factSearch')?.value||'').toLowerCase();
  const st = document.getElementById('factStatus')?.value||'';
  const tp = document.getElementById('factType')?.value||'';
  let list = [...db.factures].sort((a,b)=>new Date(b.date)-new Date(a.date));
  list = list.filter(f=>{
    if(st && f.statut!==st) return false;
    if(tp && f.type!==tp) return false;
    if(q){
      const c = db.clients.find(x=>x.id===f.clientId);
      const s = (f.numero+' '+(c?c.nom+' '+c.prenom:'')+' '+(f.clientNom||'')).toLowerCase();
      if(!s.includes(q)) return false;
    }
    return true;
  });
  document.getElementById('facturesTable').innerHTML = list.length ? list.map(f=>{
    const c = db.clients.find(x=>x.id===f.clientId);
    return `<tr>
      <td><strong>${escapeHtml(f.numero)}</strong></td>
      <td>${escapeHtml(fmtDate(f.date))}</td>
      <td>${escapeHtml(c?c.prenom+' '+c.nom:(f.clientNom||'-'))}</td>
      <td><span class="badge badge-neutral">${escapeHtml(f.type)}</span></td>
      <td>${escapeHtml(fmt(f.total))}</td>
      <td>${escapeHtml(fmt(f.paye))}</td>
      <td style="color:var(--danger);font-weight:600">${escapeHtml(fmt(f.total-f.paye))}</td>
      <td>${statutBadge(f.statut)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="viewFacture('${escapeInline(f.id)}')">👁</button>
        ${f.statut!=='paye'?`<button class="btn btn-sm btn-green" onclick="payerFacture('${escapeInline(f.id)}')">💰</button>`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteFacture('${escapeInline(f.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" class="empty">Aucune facture</td></tr>`;
}
function viewFacture(id){
  const f = db.factures.find(x=>x.id===id);
  const c = db.clients.find(x=>x.id===f.clientId);
  openModal('Facture '+f.numero,`
    <div class="invoice" id="invoicePrint">
      <div class="invoice-header">
        <div class="invoice-logo">
          <h2>${escapeHtml(db.config.raison||db.config.nom)}</h2>
          <p style="font-weight:600;color:var(--gold-dark)">${escapeHtml(db.config.nom)}</p>
          <p>${escapeHtml(db.config.adresse)}</p>
          <p>${escapeHtml(db.config.tel)}</p>
          <p>${escapeHtml(db.config.email)}${escapeHtml(db.config.site?' • '+db.config.site:'')}</p>
        </div>
        <div class="invoice-title">
          <h3>FACTURE</h3>
          <p><strong>${escapeHtml(f.numero)}</strong></p>
          <p>Date : ${escapeHtml(fmtDate(f.date))}</p>
        </div>
      </div>
      <div class="invoice-info">
        <div class="section">
          <h5>FACTURÉ À</h5>
          <div style="font-weight:600">${escapeHtml(c?c.prenom+' '+c.nom:(f.clientNom||'Client'))}</div>
          ${c?`<div>${escapeHtml(c.tel)}</div><div>${escapeHtml(c.email||'')}</div><div>${escapeHtml(c.ville||'')}</div>`:''}
        </div>
        <div class="section">
          <h5>INFORMATIONS</h5>
          <div>Type : <strong>${escapeHtml(f.type)}</strong></div>
          <div>Statut : ${statutBadge(f.statut)}</div>
          ${f.refResa?`<div>Réf. réservation : ${escapeHtml(f.refResa)}</div>`:''}
          ${f.refCmd?`<div>Réf. commande : ${escapeHtml(f.refCmd)}</div>`:''}
        </div>
      </div>
      <table>
        <thead><tr><th>Désignation</th><th style="text-align:center">Qté</th><th style="text-align:right">P.U.</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${f.lignes.map(l=>`<tr><td>${escapeHtml(l.designation)}</td><td style="text-align:center">${escapeHtml(l.qte)}</td><td style="text-align:right">${escapeHtml(fmt(l.pu))}</td><td style="text-align:right">${escapeHtml(fmt(l.total))}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="invoice-totals">
        <table>
          <tr><td>Total HT</td><td style="text-align:right">${escapeHtml(fmt(f.totalHT))}</td></tr>
          <tr><td>TVA (${escapeHtml(f.totalHT?Math.round(Number(f.tva)/Number(f.totalHT)*100):0)}%)</td><td style="text-align:right">${escapeHtml(fmt(f.tva))}</td></tr>
          <tr class="total-row"><td>TOTAL TTC</td><td style="text-align:right">${escapeHtml(fmt(f.total))}</td></tr>
          <tr><td>Payé</td><td style="text-align:right;color:var(--success)">${escapeHtml(fmt(f.paye))}</td></tr>
          <tr><td>Reste à payer</td><td style="text-align:right;color:var(--danger);font-weight:700">${escapeHtml(fmt(f.total-f.paye))}</td></tr>
        </table>
      </div>
      <div class="invoice-footer">
        <p style="font-style:italic;color:var(--brown-dark)">« ${escapeHtml(db.config.slogan)} »</p>
        <p style="font-size:11px">${escapeHtml(db.config.rccm?'RCCM: '+db.config.rccm:'')}${escapeHtml(db.config.nif?' • IFU: '+db.config.nif:'')}${escapeHtml(db.config.bcb?' • BCB: '+db.config.bcb:'')}</p>
        ${db.config.agrement?`<p style="font-size:11px">Agrément: ${escapeHtml(db.config.agrement)}</p>`:''}
        <p style="margin-top:8px">Merci de votre confiance</p>
      </div>
    </div>
  `,`
    <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    <button class="btn btn-gold" onclick="printInvoice()">🖨 Imprimer</button>
  `);
  document.getElementById('modalBox').classList.add('lg');
}
function printableReport(id){
 return DOMPurify.sanitize(document.getElementById(id)?.innerHTML||'',{FORBID_TAGS:['button','script','iframe','object','embed','input','select','textarea'],FORBID_ATTR:['onclick','onchange','onsubmit','oninput','srcdoc']});
}
function printInvoice(){
  const w = window.open('','_blank');
  const html = document.getElementById('invoicePrint').outerHTML;
  w.document.write(`<html><head><title>Facture</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Inter',sans-serif;padding:30px;color:#1A1310}
      .invoice{max-width:800px;margin:0 auto}
      .invoice-header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #D4A017;margin-bottom:20px}
      .invoice-logo h2{font-family:'Playfair Display',serif;font-size:22px;color:#3E2712;margin:0}
      .invoice-logo p{font-size:11px;color:#6B5B4A;margin:2px 0}
      .invoice-title{text-align:right}
      .invoice-title h3{font-size:24px;color:#D4A017;margin:0}
      .invoice-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
      .invoice-info .section{background:#FDF8EF;padding:12px;border-radius:8px}
      .invoice-info h5{font-size:11px;text-transform:uppercase;color:#6B5B4A;margin:0 0 6px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#F7EFDD;padding:10px;text-align:left;border-bottom:2px solid #D4A017;font-size:11px;text-transform:uppercase}
      td{padding:10px;border-bottom:1px solid #E9DCC3}
      .invoice-totals{display:flex;justify-content:flex-end;margin-top:16px}
      .invoice-totals table{width:auto;min-width:280px}
      .invoice-totals td{padding:6px 12px;border:none}
      .total-row td{background:#3E2712;color:#fff;font-weight:700;font-size:15px}
      .invoice-footer{margin-top:30px;padding-top:16px;border-top:1px solid #E9DCC3;text-align:center;font-size:11px;color:#6B5B4A}
      .badge{padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600}
    </style></head><body>${html}<script>window.onload=()=>window.print();<\/script></body></html>`);
  w.document.close();
}
async function payerFacture(id){
 const f=db.factures.find(x=>x.id===id);if(!f)return;
 if(!sessionActive()){toast('Ouvrez la caisse avant d’encaisser','warning');return;}
 const reste=f.total-f.paye;const value=prompt('Montant à encaisser (reste : '+fmt(reste)+')',reste);if(!value)return;
 const montant=Number(value);
 if(!Number.isFinite(montant)||montant<=0||montant>reste){toast('Le paiement doit être positif et ne pas dépasser le reste à payer','error');return;}
 if(!cloudReady){toast('Une connexion serveur est nécessaire pour encaisser','danger');return;}
 await queueCloudSync();if(window.hotelSyncPending||recoveryBlocked){toast('Récupérez les modifications en attente avant d’encaisser','warning');return;}
 const key='soonre-payment:'+db.hotelId+':'+id;let operation;
 try{const old=JSON.parse(localStorage.getItem(key)||'null');operation=old?.montant===montant?old.operation:crypto.randomUUID();localStorage.setItem(key,JSON.stringify({operation,montant}));}catch{operation=crypto.randomUUID();}
 const{error}=await callServerRPC('encaisser_facture',{p_id:id,p_montant:montant,p_operation:operation});
 if(error){toast('Paiement non confirmé : '+error.message+'. Réessayez avec le même montant.','danger');return;}
 localStorage.removeItem(key);
 try{await loadCloudState();renderFactures();renderCaisse();toast('Paiement confirmé par le serveur');}catch(error){toast('Paiement enregistré ; rechargez les données : '+error.message,'warning');}
}
function deleteFacture(id){
  confirmDialog('Supprimer cette facture ?',()=>{
    db.factures=db.factures.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB();renderFactures();toast('Supprimée');
  });
}

// ============ CAISSE ============
function renderCaisse(){
  renderSessionBanner();
  const q = (document.getElementById('caisseSearch')?.value||'').toLowerCase();
  const tp = document.getElementById('caisseType')?.value||'';
  const md = document.getElementById('caisseMode')?.value||'';
  let list = [...db.caisse].sort((a,b)=>new Date(b.date)-new Date(a.date));
  list = list.filter(c=>{
    if(tp && c.type!==tp) return false;
    if(md && c.mode!==md) return false;
    if(q && !(c.description+' '+c.ref).toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById('caisseTable').innerHTML = list.length ? list.map(c=>`
    <tr>
      <td>${escapeHtml(fmtDate(c.date))}</td>
      <td><strong>${escapeHtml(c.ref)}</strong></td>
      <td>${escapeHtml(c.description)}${c.sessionId?'<br><small style="color:var(--muted)">Session '+c.sessionId.slice(-6)+'</small>':escapeHtml('')}</td>
      <td>${c.type==='entree'?'<span class="badge badge-success">Entrée</span>':'<span class="badge badge-danger">Sortie</span>'}</td>
      <td><span class="badge badge-neutral">${escapeHtml(modeLabel(c.mode))}</span></td>
      <td style="font-weight:700;color:${escapeHtml(c.type==='entree'?'var(--success)':'var(--danger)')}">${escapeHtml(c.type==='entree'?'+':'-')} ${escapeHtml(fmt(c.montant))}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteMouv('${escapeInline(c.id)}')">×</button></td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty">Aucun mouvement</td></tr>`;

  const today = new Date().toISOString().slice(0,10);
  const todayList = db.caisse.filter(c=>c.date===today);
  const inSum = todayList.filter(c=>c.type==='entree').reduce((s,c)=>s+c.montant,0);
  const outSum = todayList.filter(c=>c.type==='sortie').reduce((s,c)=>s+c.montant,0);
  document.getElementById('caisseIn').textContent = fmt(inSum);
  document.getElementById('caisseOut').textContent = fmt(outSum);
  const soldeTotal = db.caisse.reduce((s,c)=>s+(c.type==='entree'?c.montant:-c.montant),0);
  document.getElementById('caisseSolde').textContent = fmt(soldeTotal);
  document.getElementById('caisseCount').textContent = todayList.length;
}
// ========== SESSIONS DE CAISSE (Ouverture / Fermeture) ==========
function sessionActive(){
  return db.sessionsCaisse.find(s=>s.statut==='ouverte');
}
function renderSessionBanner(){
  const el = document.getElementById('sessionCaisseBanner');
  if(!el) return;
  const s = sessionActive();
  if(s){
    const mvts = db.caisse.filter(c=>c.sessionId===s.id);
    const entrees = mvts.filter(c=>c.type==='entree').reduce((a,b)=>a+b.montant,0);
    const sorties = mvts.filter(c=>c.type==='sortie').reduce((a,b)=>a+b.montant,0);
    const soldeAttendu = s.fondInitial + entrees - sorties;
    el.innerHTML = `<div class="card" style="border-left:4px solid var(--success);margin-bottom:14px;background:linear-gradient(135deg,#f0f9f0 0%,#fff 100%)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-size:11px;color:var(--muted);letter-spacing:1px">CAISSE OUVERTE</div>
          <div style="font-size:16px;font-weight:700;color:var(--brown-dark)">🔓 Session ${escapeHtml(s.numero)}</div>
          <div style="font-size:12px;color:var(--muted)">Ouverte le ${escapeHtml(fmtDateTime(s.dateOuverture))} par <strong>${escapeHtml(s.ouverturePar)}</strong></div>
        </div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <div><div style="font-size:10px;color:var(--muted)">FOND INITIAL</div><div style="font-weight:700">${escapeHtml(fmt(s.fondInitial))}</div></div>
          <div><div style="font-size:10px;color:var(--muted)">ENTRÉES</div><div style="font-weight:700;color:var(--success)">+${escapeHtml(fmt(entrees))}</div></div>
          <div><div style="font-size:10px;color:var(--muted)">SORTIES</div><div style="font-weight:700;color:var(--danger)">-${escapeHtml(fmt(sorties))}</div></div>
          <div style="background:var(--gold-soft);padding:8px 14px;border-radius:8px">
            <div style="font-size:10px;color:var(--muted)">SOLDE ATTENDU</div>
            <div style="font-weight:800;font-size:18px;color:var(--brown-dark)">${escapeHtml(fmt(soldeAttendu))}</div>
          </div>
        </div>
      </div>
    </div>`;
  } else {
    el.innerHTML = `<div class="card" style="border-left:4px solid var(--danger);margin-bottom:14px;background:#fdf5f0">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--muted);letter-spacing:1px">CAISSE FERMÉE</div>
          <div style="font-size:16px;font-weight:700;color:var(--danger)">🔒 Aucune session active</div>
          <div style="font-size:12px;color:var(--muted)">Cliquez sur <strong>Ouvrir caisse</strong> pour démarrer une nouvelle session</div>
        </div>
        <button class="btn btn-green" onclick="ouvrirCaisse()">🔓 Ouvrir la caisse</button>
      </div>
    </div>`;
  }
}
function ouvrirCaisse(){
  if(sessionActive()){
    toast("Une session est déjà ouverte. Fermez-la d'abord.",'warning');
    return;
  }
  const user = db.currentUser?db.currentUser.nom:'Utilisateur';
  // Dernier solde connu (fin de session précédente)
  const derniere = [...db.sessionsCaisse].reverse().find(s=>s.statut==='fermee');
  const suggFond = derniere?derniere.montantCompte:0;
  openModal('🔓 Ouverture de caisse',`
    <form id="ocForm" onsubmit="confirmerOuverture(event)">
      <div class="form-grid">
        <div class="form-group"><label>Caissier / Responsable</label><input class="form-control" id="ocUser" value="${escapeHtml(user)}" readonly></div>
        <div class="form-group"><label>Date & heure d'ouverture</label><input class="form-control" value="${escapeHtml(new Date().toLocaleString('fr-FR'))}" readonly></div>
        <div class="form-group full" style="background:var(--gold-soft);padding:12px;border-radius:8px">
          <label>Fond de caisse initial (espèces en caisse au démarrage)</label>
          <input type="number" class="form-control" id="ocFond" required min="0" value="${escapeHtml(suggFond)}" autofocus style="font-size:20px;font-weight:700">
          <small style="color:var(--muted)">${escapeHtml(derniere?'Suggéré depuis la clôture précédente ('+fmtDate(derniere.dateFermeture)+')':'Aucune session précédente')}</small>
        </div>
        <div class="form-group full"><label>Note d'ouverture</label><textarea class="form-control" id="ocNote" rows="2" placeholder="Observations, remise/reprise de caisse, etc."></textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-green" onclick="document.getElementById('ocForm').requestSubmit()">🔓 Ouvrir la caisse</button>`);
}
function confirmerOuverture(e){
  e.preventDefault();
  const num = 'SC-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(db.sessionsCaisse.length+1).padStart(3,'0');
  const s = {
    id: uid('sc'),
    numero: num,
    dateOuverture: new Date().toISOString(),
    ouverturePar: db.currentUser?db.currentUser.nom:'—',
    fondInitial: parseFloat(document.getElementById('ocFond').value)||0,
    noteOuverture: document.getElementById('ocNote').value,
    dateFermeture: null,
    fermeturePar: null,
    montantCompte: null,
    montantAttendu: null,
    ecart: null,
    noteFermeture: '',
    statut: 'ouverte'
  };
  db.sessionsCaisse.push(s);
  saveDB(); closeModal(); renderCaisse();
  toast('Caisse ouverte — Session '+num);
}
function fermerCaisse(){
  const s = sessionActive();
  if(!s){ toast('Aucune session à fermer','warning'); return; }
  const mvts = db.caisse.filter(c=>c.sessionId===s.id);
  const entrees = mvts.filter(c=>c.type==='entree').reduce((a,b)=>a+b.montant,0);
  const sorties = mvts.filter(c=>c.type==='sortie').reduce((a,b)=>a+b.montant,0);
  // Uniquement espèces pour le comptage physique
  const espEnt = mvts.filter(c=>c.type==='entree'&&c.mode==='espece').reduce((a,b)=>a+b.montant,0);
  const espSor = mvts.filter(c=>c.type==='sortie'&&c.mode==='espece').reduce((a,b)=>a+b.montant,0);
  const soldeAttendu = s.fondInitial + entrees - sorties;
  const soldeEspAttendu = s.fondInitial + espEnt - espSor;
  openModal('🔒 Fermeture de caisse — Session '+s.numero,`
    <form id="fcForm" onsubmit="confirmerFermeture(event,'${escapeInline(s.id)}')">
      <div style="background:var(--gold-soft);padding:14px;border-radius:8px;margin-bottom:16px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
          <div><div style="font-size:10px;color:var(--muted)">FOND INITIAL</div><div style="font-weight:700">${escapeHtml(fmt(s.fondInitial))}</div></div>
          <div><div style="font-size:10px;color:var(--muted)">TOTAL ENTRÉES</div><div style="font-weight:700;color:var(--success)">+${escapeHtml(fmt(entrees))}</div></div>
          <div><div style="font-size:10px;color:var(--muted)">TOTAL SORTIES</div><div style="font-weight:700;color:var(--danger)">-${escapeHtml(fmt(sorties))}</div></div>
          <div><div style="font-size:10px;color:var(--muted)">MOUVEMENTS</div><div style="font-weight:700">${escapeHtml(mvts.length)}</div></div>
        </div>
        <hr style="margin:12px 0;border:none;border-top:1px dashed var(--line)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div style="font-size:11px;color:var(--muted)">SOLDE ATTENDU (TOUS MODES)</div><div style="font-weight:800;font-size:18px">${escapeHtml(fmt(soldeAttendu))}</div></div>
          <div><div style="font-size:11px;color:var(--muted)">SOLDE ESPÈCES ATTENDU</div><div style="font-weight:800;font-size:18px;color:var(--brown-dark)">${escapeHtml(fmt(soldeEspAttendu))}</div></div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group full">
          <label>💰 Montant compté physiquement en caisse (espèces)</label>
          <input type="number" class="form-control" id="fcCompte" required min="0" value="${escapeHtml(soldeEspAttendu)}" autofocus style="font-size:22px;font-weight:700;text-align:center">
        </div>
        <div class="form-group full" id="fcEcartBox" style="padding:10px;border-radius:8px;background:#f5f5f5">
          <div style="font-size:11px;color:var(--muted)">ÉCART DE CAISSE</div>
          <div id="fcEcart" style="font-size:20px;font-weight:800">0 FCFA</div>
        </div>
        <div class="form-group full"><label>Observations / motif d'écart</label><textarea class="form-control" id="fcNote" rows="2"></textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="imprimerRapportSession('${escapeInline(s.id)}')">🖨 Aperçu rapport Z</button>
     <button class="btn btn-danger" onclick="document.getElementById('fcForm').requestSubmit()">🔒 Confirmer fermeture</button>`);
  // Calculer écart en direct
  const attendu = soldeEspAttendu;
  const calc = ()=>{
    const c = parseFloat(document.getElementById('fcCompte').value)||0;
    const ec = c - attendu;
    const box = document.getElementById('fcEcartBox');
    const lbl = document.getElementById('fcEcart');
    lbl.textContent = (ec>=0?'+':'') + fmt(ec);
    if(ec===0){ box.style.background='#e8f5e9'; lbl.style.color='var(--success)'; }
    else if(ec>0){ box.style.background='#fff8e1'; lbl.style.color='#c17d00'; }
    else { box.style.background='#ffebee'; lbl.style.color='var(--danger)'; }
  };
  setTimeout(()=>{ document.getElementById('fcCompte').addEventListener('input',calc); calc(); },50);
}
function confirmerFermeture(e, sid){
  e.preventDefault();
  const s = db.sessionsCaisse.find(x=>x.id===sid);
  const mvts = db.caisse.filter(c=>c.sessionId===s.id);
  const espEnt = mvts.filter(c=>c.type==='entree'&&c.mode==='espece').reduce((a,b)=>a+b.montant,0);
  const espSor = mvts.filter(c=>c.type==='sortie'&&c.mode==='espece').reduce((a,b)=>a+b.montant,0);
  const soldeEspAttendu = s.fondInitial + espEnt - espSor;
  const compte = parseFloat(document.getElementById('fcCompte').value)||0;
  s.dateFermeture = new Date().toISOString();
  s.fermeturePar = db.currentUser?db.currentUser.nom:'—';
  s.montantCompte = compte;
  s.montantAttendu = soldeEspAttendu;
  s.ecart = compte - soldeEspAttendu;
  s.noteFermeture = document.getElementById('fcNote').value;
  s.statut = 'fermee';
  saveDB(); closeModal(); renderCaisse();
  toast('Caisse fermée — Session '+s.numero+' (écart: '+fmt(s.ecart)+')', s.ecart===0?'success':'warning');
  // Proposer impression
  setTimeout(()=>{ if(confirm('Imprimer le rapport Z de clôture ?')) imprimerRapportSession(s.id); }, 300);
}
function voirSessions(){
  const list = [...db.sessionsCaisse].reverse();
  openModal('📋 Historique des sessions de caisse',`
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>N° Session</th><th>Ouverte le</th><th>Fermée le</th><th>Fond</th>
          <th>Compté</th><th>Écart</th><th>Statut</th><th>Actions</th>
        </tr></thead>
        <tbody>${list.length?list.map(s=>`
          <tr>
            <td><strong>${escapeHtml(s.numero)}</strong><br><small style="color:var(--muted)">${escapeHtml(s.ouverturePar)}</small></td>
            <td>${escapeHtml(fmtDateTime(s.dateOuverture))}</td>
            <td>${escapeHtml(s.dateFermeture?fmtDateTime(s.dateFermeture):'—')}</td>
            <td>${escapeHtml(fmt(s.fondInitial))}</td>
            <td>${escapeHtml(s.montantCompte!==null?fmt(s.montantCompte):'—')}</td>
            <td style="font-weight:700;color:${escapeHtml(s.ecart===null?'var(--muted)':(s.ecart===0?'var(--success)':(s.ecart>0?'#c17d00':'var(--danger)')))}">${escapeHtml(s.ecart!==null?(s.ecart>=0?'+':'')+fmt(s.ecart):'—')}</td>
            <td>${s.statut==='ouverte'?'<span class="badge badge-success">Ouverte</span>':'<span class="badge badge-neutral">Fermée</span>'}</td>
            <td><button class="btn btn-sm btn-gold" onclick="imprimerRapportSession('${escapeInline(s.id)}')">🖨</button></td>
          </tr>
        `).join(''):'<tr><td colspan="8" class="empty">Aucune session</td></tr>'}</tbody>
      </table>
    </div>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>`);
}
function imprimerRapportSession(sid){
  const s = db.sessionsCaisse.find(x=>x.id===sid);
  if(!s) return;
  const mvts = db.caisse.filter(c=>c.sessionId===s.id);
  const entrees = mvts.filter(c=>c.type==='entree');
  const sorties = mvts.filter(c=>c.type==='sortie');
  const totIn = entrees.reduce((a,b)=>a+b.montant,0);
  const totOut = sorties.reduce((a,b)=>a+b.montant,0);
  // Ventilation par mode
  const parMode = {espece:{in:0,out:0},mobile:{in:0,out:0},virement:{in:0,out:0},carte:{in:0,out:0}};
  mvts.forEach(m=>{ if(parMode[m.mode]) parMode[m.mode][m.type==='entree'?'in':'out']+=m.montant; });
  const c = db.config;
  const w = window.open('','_blank','width=800,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Z — ${escapeHtml(s.numero)}</title>
    <style>
      body{font-family:'Helvetica',sans-serif;padding:25px;color:#333;font-size:12px}
      h1{color:#5C3A1E;margin:0;font-size:20px}
      .head{display:flex;justify-content:space-between;border-bottom:3px solid #D4A017;padding-bottom:12px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left;font-size:11px}
      th{background:#5C3A1E;color:#fff}
      .box{background:#FDF8EF;padding:10px 12px;border-radius:6px;margin:10px 0}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .total{background:#D4A017;color:#fff;font-weight:700}
      .ecart-ok{color:#1F4A2B;font-weight:800}
      .ecart-ko{color:#B23A3A;font-weight:800}
      .footer{margin-top:20px;font-size:10px;text-align:center;color:#666;border-top:1px solid #ddd;padding-top:10px}
    </style></head><body>
    <div class="head">
      <div>
        <h1>${escapeHtml(c.raison||c.nom)}</h1>
        <div><strong>${escapeHtml(c.nom)}</strong></div>
        <div>${escapeHtml(c.adresse)}</div>
        <div>${escapeHtml(c.tel)}</div>
      </div>
      <div style="text-align:right">
        <h2 style="color:#D4A017;margin:0;font-size:16px">RAPPORT Z DE CAISSE</h2>
        <div><strong>${escapeHtml(s.numero)}</strong></div>
        <div>Statut: <strong>${escapeHtml(s.statut.toUpperCase())}</strong></div>
      </div>
    </div>

    <div class="box grid">
      <div><strong>Ouverture</strong><br>${escapeHtml(new Date(s.dateOuverture).toLocaleString('fr-FR'))}<br>Par: ${escapeHtml(s.ouverturePar)}</div>
      <div><strong>Fermeture</strong><br>${escapeHtml(s.dateFermeture?new Date(s.dateFermeture).toLocaleString('fr-FR'):'— En cours —')}<br>${escapeHtml(s.fermeturePar?'Par: '+s.fermeturePar:'')}</div>
    </div>

    <h3 style="margin:14px 0 6px;color:#5C3A1E">Récapitulatif financier</h3>
    <table>
      <tr><td>Fond de caisse initial</td><td style="text-align:right">${escapeHtml(fmt(s.fondInitial))}</td></tr>
      <tr><td>Total encaissements (${escapeHtml(entrees.length)})</td><td style="text-align:right;color:#1F4A2B">+ ${escapeHtml(fmt(totIn))}</td></tr>
      <tr><td>Total décaissements (${escapeHtml(sorties.length)})</td><td style="text-align:right;color:#B23A3A">- ${escapeHtml(fmt(totOut))}</td></tr>
      <tr class="total"><td>SOLDE THÉORIQUE TOTAL</td><td style="text-align:right">${escapeHtml(fmt(s.fondInitial+totIn-totOut))}</td></tr>
    </table>

    <h3 style="margin:14px 0 6px;color:#5C3A1E">Ventilation par mode de paiement</h3>
    <table>
      <thead><tr><th>Mode</th><th style="text-align:right">Entrées</th><th style="text-align:right">Sorties</th><th style="text-align:right">Solde</th></tr></thead>
      <tbody>
        ${Object.entries(parMode).map(([m,v])=>`<tr><td>${escapeHtml(modeLabel(m))}</td><td style="text-align:right">${escapeHtml(fmt(v.in))}</td><td style="text-align:right">${escapeHtml(fmt(v.out))}</td><td style="text-align:right"><strong>${escapeHtml(fmt(v.in-v.out))}</strong></td></tr>`).join('')}
      </tbody>
    </table>

    ${s.statut==='fermee'?`
    <h3 style="margin:14px 0 6px;color:#5C3A1E">Comptage physique (espèces)</h3>
    <table>
      <tr><td>Solde espèces théorique</td><td style="text-align:right">${escapeHtml(fmt(s.montantAttendu))}</td></tr>
      <tr><td>Montant compté en caisse</td><td style="text-align:right">${escapeHtml(fmt(s.montantCompte))}</td></tr>
      <tr class="total"><td>ÉCART</td><td style="text-align:right" class="${escapeHtml(s.ecart===0?'ecart-ok':'ecart-ko')}">${escapeHtml(s.ecart>=0?'+':'')}${escapeHtml(fmt(s.ecart))}</td></tr>
    </table>
    ${s.noteFermeture?`<div class="box"><strong>Observations:</strong> ${escapeHtml(s.noteFermeture)}</div>`:''}
    `:''}

    <h3 style="margin:14px 0 6px;color:#5C3A1E">Détail des mouvements (${escapeHtml(mvts.length)})</h3>
    <table>
      <thead><tr><th>Réf.</th><th>Description</th><th>Mode</th><th style="text-align:right">Entrée</th><th style="text-align:right">Sortie</th></tr></thead>
      <tbody>
        ${mvts.map(m=>`<tr>
          <td>${escapeHtml(m.ref)}</td><td>${escapeHtml(m.description)}</td><td>${escapeHtml(modeLabel(m.mode))}</td>
          <td style="text-align:right;color:#1F4A2B">${escapeHtml(m.type==='entree'?fmt(m.montant):'')}</td>
          <td style="text-align:right;color:#B23A3A">${escapeHtml(m.type==='sortie'?fmt(m.montant):'')}</td>
        </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#999">Aucun mouvement</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top:25px;display:flex;justify-content:space-between">
      <div>Signature Caissier<br><br>____________________</div>
      <div>Signature Direction<br><br>____________________</div>
    </div>

    <div class="footer">
      « ${escapeHtml(c.slogan||'')} » — Rapport imprimé le ${escapeHtml(new Date().toLocaleString('fr-FR'))}
    </div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
}
function modeLabel(m){
  return ({espece:'Espèces',mobile:'Mobile Money',virement:'Virement',carte:'Carte'})[m]||m;
}
function openMouvementModal(){
  if(!sessionActive()){
    toast('⛔ La caisse est fermée. Ouvrez une session avant de saisir un mouvement.','warning');
    return;
  }
  openModal('Nouveau mouvement de caisse',`
    <form id="mvForm" onsubmit="saveMouvement(event)">
      <div class="form-grid">
        <div class="form-group"><label>Type *</label>
          <select class="form-control" id="mvType" required>
            <option value="entree">Entrée</option>
            <option value="sortie">Sortie</option>
          </select>
        </div>
        <div class="form-group"><label>Mode *</label>
          <select class="form-control" id="mvMode" required>
            <option value="espece">Espèces</option>
            <option value="mobile">Mobile Money</option>
            <option value="virement">Virement</option>
            <option value="carte">Carte</option>
          </select>
        </div>
        <div class="form-group full"><label>Description *</label><input class="form-control" id="mvDesc" required></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-control" id="mvDate" value="${escapeHtml(new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Montant (FCFA) *</label><input type="number" class="form-control" id="mvMontant" required min="0"></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('mvForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveMouvement(e){
  e.preventDefault();
  const s = sessionActive();
  db.caisse.push({
    id:uid('cs'),
    date:document.getElementById('mvDate').value,
    ref:(document.getElementById('mvType').value==='entree'?'ENC':'DEP')+'-'+(3000+db.caisse.length),
    description:document.getElementById('mvDesc').value,
    type:document.getElementById('mvType').value,
    mode:document.getElementById('mvMode').value,
    montant:parseFloat(document.getElementById('mvMontant').value)||0,
    sessionId: s?s.id:null
  });
  saveDB();closeModal();renderCaisse();toast('Enregistré');
}
function deleteMouv(id){
  confirmDialog('Supprimer ce mouvement ?',()=>{
    db.caisse=db.caisse.filter(x=>x.id!==id);saveDB();renderCaisse();toast('Supprimé');
  });
}

// ============ DEPENSES ============
function renderDepenses(){
  const q = (document.getElementById('depSearch')?.value||'').toLowerCase();
  const cat = document.getElementById('depCat')?.value||'';
  let list = [...db.depenses].sort((a,b)=>new Date(b.date)-new Date(a.date));
  list = list.filter(d=>{
    if(cat && d.categorie!==cat) return false;
    if(q && !(d.description+' '+d.fournisseur).toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById('depensesTable').innerHTML = list.length ? list.map(d=>`
    <tr>
      <td>${escapeHtml(fmtDate(d.date))}</td>
      <td>${escapeHtml(d.description)}</td>
      <td><span class="badge badge-neutral">${escapeHtml(d.categorie)}</span></td>
      <td>${escapeHtml(d.fournisseur||'-')}</td>
      <td style="font-weight:600;color:var(--danger)">${escapeHtml(fmt(d.montant))}</td>
      <td>${statutBadge(d.statut)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editDep('${escapeInline(d.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDep('${escapeInline(d.id)}')">×</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty">Aucune dépense</td></tr>`;
}
function openDepenseModal(id){
  const d = id ? db.depenses.find(x=>x.id===id) : null;
  openModal(id?'Modifier dépense':'Nouvelle dépense',`
    <form id="dpForm" onsubmit="saveDepense(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Description *</label><input class="form-control" id="dpDesc" required value="${escapeHtml(d?d.description:'')}"></div>
        <div class="form-group"><label>Catégorie *</label>
          <select class="form-control" id="dpCat">${['Achats','Salaires','Charges','Maintenance','Marketing','Autres'].map(c=>`<option ${escapeHtml(d&&d.categorie===c?'selected':'')}>${escapeHtml(c)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Fournisseur</label><input class="form-control" id="dpFourn" value="${escapeHtml(d?d.fournisseur||'':'')}"></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-control" id="dpDate" value="${escapeHtml(d?d.date:new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Montant (FCFA) *</label><input type="number" class="form-control" id="dpMontant" required value="${escapeHtml(d?d.montant:0)}" min="0"></div>
        <div class="form-group"><label>Mode de paiement</label>
          <select class="form-control" id="dpMode">
            <option value="espece" ${escapeHtml(d&&d.mode==='espece'?'selected':'')}>Espèces</option>
            <option value="mobile" ${escapeHtml(d&&d.mode==='mobile'?'selected':'')}>Mobile Money</option>
            <option value="virement" ${escapeHtml(d&&d.mode==='virement'?'selected':'')}>Virement</option>
            <option value="carte" ${escapeHtml(d&&d.mode==='carte'?'selected':'')}>Carte</option>
          </select>
        </div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="dpStatut">
            <option value="paye" ${escapeHtml(!d||d.statut==='paye'?'selected':'')}>Payée</option>
            <option value="impaye" ${escapeHtml(d&&d.statut==='impaye'?'selected':'')}>Impayée</option>
          </select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('dpForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveDepense(e,id){
  e.preventDefault();
  const data = {
    description:document.getElementById('dpDesc').value,
    categorie:document.getElementById('dpCat').value,
    fournisseur:document.getElementById('dpFourn').value,
    date:document.getElementById('dpDate').value,
    montant:parseFloat(document.getElementById('dpMontant').value)||0,
    mode:document.getElementById('dpMode').value,
    statut:document.getElementById('dpStatut').value
  };
  if(id){
    Object.assign(db.depenses.find(x=>x.id===id),data);
  } else {
    db.depenses.push({id:uid('dp'),...data});
    if(data.statut==='paye'){
      db.caisse.push({
        id:uid('cs'),date:data.date,ref:'DEP-'+(4000+db.caisse.length),
        description:data.description,type:'sortie',mode:data.mode,montant:data.montant
      });
    }
  }
  saveDB();closeModal();renderDepenses();toast('Enregistré');
}
function editDep(id){openDepenseModal(id)}
function deleteDep(id){
  confirmDialog('Supprimer cette dépense ?',()=>{
    db.depenses=db.depenses.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB();renderDepenses();toast('Supprimée');
  });
}

// ============ PERSONNEL ============
function renderPersonnel(){
  const q = (document.getElementById('empSearch')?.value||'').toLowerCase();
  const sv = document.getElementById('empService')?.value||'';
  let list = db.personnel.filter(p=>{
    if(sv && p.service!==sv) return false;
    if(q && !(p.nom+' '+p.prenom+' '+p.poste).toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById('personnelTable').innerHTML = list.length ? list.map(p=>`
    <tr>
      <td><strong>${escapeHtml(p.matricule||'—')}</strong></td>
      <td>${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}${p.cnss?'<br><small style="color:var(--muted)">CNSS: '+p.cnss+'</small>':escapeHtml('')}</td>
      <td>${escapeHtml(p.poste)}</td>
      <td><span class="badge badge-neutral">${escapeHtml(p.service)}</span></td>
      <td>${escapeHtml(p.tel)}</td>
      <td>${escapeHtml(fmt(p.salaire))}</td>
      <td>${statutBadge(p.actif?'actif':'inactif')}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editEmp('${escapeInline(p.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmp('${escapeInline(p.id)}')">×</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" class="empty">Aucun employé</td></tr>`;
}
function openEmpModal(id){
  const p = id ? db.personnel.find(x=>x.id===id) : null;
  openModal(id?'Modifier employé':'Nouvel employé',`
    <form id="epForm" onsubmit="saveEmp(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Matricule</label><input class="form-control" id="epMat" value="${escapeHtml(p?p.matricule||'':'HS-'+String(db.personnel.length+1).padStart(4,'0'))}"></div>
        <div class="form-group"><label>Nom *</label><input class="form-control" id="epNom" required value="${escapeHtml(p?p.nom:'')}"></div>
        <div class="form-group"><label>Prénom *</label><input class="form-control" id="epPrenom" required value="${escapeHtml(p?p.prenom:'')}"></div>
        <div class="form-group"><label>Poste *</label><input class="form-control" id="epPoste" required value="${escapeHtml(p?p.poste:'')}"></div>
        <div class="form-group"><label>Service *</label>
          <select class="form-control" id="epService">${['Direction','Gérance','Accueil / Réception','Restauration','Ménage','Sécurité / Veille','Maintenance','Administration'].map(s=>`<option ${escapeHtml(p&&p.service===s?'selected':'')}>${escapeHtml(s)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Téléphone</label><input class="form-control" id="epTel" value="${escapeHtml(p?p.tel||'':'')}"></div>
        <div class="form-group"><label>N° CNSS</label><input class="form-control" id="epCnss" value="${escapeHtml(p?p.cnss||'':'')}"></div>
        <div class="form-group"><label>Type contrat</label>
          <select class="form-control" id="epContrat">
            ${['CDI','CDD','Journalier','Stage'].map(t=>`<option ${escapeHtml(p&&p.typeContrat===t?'selected':'')}>${escapeHtml(t)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Salaire de base (FCFA)</label><input type="number" class="form-control" id="epSal" value="${escapeHtml(p?p.salaire:80000)}" min="0"></div>
        <div class="form-group"><label>Date embauche</label><input type="date" class="form-control" id="epDate" value="${escapeHtml(p?p.dateEmbauche:new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="epActif">
            <option value="1" ${escapeHtml(!p||p.actif?'selected':'')}>Actif</option>
            <option value="0" ${escapeHtml(p&&!p.actif?'selected':'')}>Inactif</option>
          </select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('epForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveEmp(e,id){
  e.preventDefault();
  const data = {
    matricule:document.getElementById('epMat').value,
    nom:document.getElementById('epNom').value,
    prenom:document.getElementById('epPrenom').value,
    poste:document.getElementById('epPoste').value,
    service:document.getElementById('epService').value,
    tel:document.getElementById('epTel').value,
    cnss:document.getElementById('epCnss').value,
    typeContrat:document.getElementById('epContrat').value,
    salaire:parseFloat(document.getElementById('epSal').value)||0,
    dateEmbauche:document.getElementById('epDate').value,
    actif:document.getElementById('epActif').value==='1'
  };
  if(id) Object.assign(db.personnel.find(x=>x.id===id),data);
  else db.personnel.push({id:uid('em'),...data});
  saveDB();closeModal();renderPersonnel();toast('Enregistré');
}
function editEmp(id){openEmpModal(id)}
function deleteEmp(id){
  confirmDialog('Supprimer cet employé ?',()=>{
    db.personnel=db.personnel.filter(x=>x.id!==id);saveDB();renderPersonnel();toast('Supprimé');
  });
}

// ============ RAPPORTS ============
let rapChartRecettes, rapChartDepenses, occupTrendChart;
function getPeriodDates(){
  const now = new Date();
  const p = document.getElementById('rapPeriod')?.value||'month';
  let start;
  if(p==='today') start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  else if(p==='week'){start=new Date(now);start.setDate(now.getDate()-7)}
  else if(p==='month') start = new Date(now.getFullYear(),now.getMonth(),1);
  else start = new Date(now.getFullYear(),0,1);
  return {start, end:now};
}
function renderRapports(){
  const {start,end} = getPeriodDates();
  const facts = db.factures.filter(f=>{const d=new Date(f.date);return d>=start&&d<=end});
  const deps = db.depenses.filter(d=>{const dt=new Date(d.date);return dt>=start&&dt<=end});
  const recettes = facts.reduce((s,f)=>s+(f.paye||0),0);
  const depenses = deps.reduce((s,d)=>s+d.montant,0);
  const benefice = recettes - depenses;
  const marge = recettes>0 ? Math.round(benefice/recettes*100) : 0;
  document.getElementById('rapRecettes').textContent = fmt(recettes);
  document.getElementById('rapDepenses').textContent = fmt(depenses);
  document.getElementById('rapBenefice').textContent = fmt(benefice);
  document.getElementById('rapMarge').textContent = marge+'%';

  // Chart recettes par service
  const parService = {hebergement:0,restauration:0,salle:0,magasin:0,mixte:0,autres:0};
  facts.forEach(f=>{
    const t = parService[f.type]!==undefined ? f.type : 'autres';
    parService[t] = (parService[t]||0)+(f.paye||0);
  });
  const ctxR = document.getElementById('rapChartRecettes');
  if(rapChartRecettes) rapChartRecettes.destroy();
  if(ctxR){
    rapChartRecettes = new Chart(ctxR,{
      type:'bar',
      data:{labels:['Hébergement','Restauration','Salles conf.','Magasins','Mixte','Autres'],datasets:[{
        data:[parService.hebergement,parService.restauration,parService.salle,parService.magasin,parService.mixte,parService.autres],
        backgroundColor:['#0E2636','#C99A4A','#23715F','#4B8992','#B23A3A','#64747C']
      }]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>fmtNum(v)}}}}
    });
  }

  // Chart depenses par cat
  const parCat = {};
  deps.forEach(d=>{parCat[d.categorie] = (parCat[d.categorie]||0)+d.montant});
  const ctxD = document.getElementById('rapChartDepenses');
  if(rapChartDepenses) rapChartDepenses.destroy();
  if(ctxD){
    rapChartDepenses = new Chart(ctxD,{
      type:'doughnut',
      data:{labels:Object.keys(parCat),datasets:[{
        data:Object.values(parCat),
        backgroundColor:['#B23A3A','#C99A4A','#0E2636','#23715F','#4B8992','#64747C']
      }]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }

  // Top clients
  const clientTotals = {};
  facts.forEach(f=>{if(f.clientId){clientTotals[f.clientId]=(clientTotals[f.clientId]||0)+(f.paye||0)}});
  const top = Object.entries(clientTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  document.getElementById('topClientsTable').innerHTML = top.length ? top.map(([cid,tot])=>{
    const c = db.clients.find(x=>x.id===cid);
    const sejours = db.reservations.filter(r=>r.clientId===cid).length;
    return `<tr><td>${escapeHtml(c?c.prenom+' '+c.nom:'-')}</td><td>${escapeHtml(sejours)}</td><td><strong>${escapeHtml(fmt(tot))}</strong></td></tr>`;
  }).join('') : `<tr><td colspan="3" class="empty">Aucune donnée</td></tr>`;

  // Occup trend (7 derniers jours)
  const days=[], vals=[];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    days.push(d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}));
    const ds = d.toISOString().slice(0,10);
    const active = db.reservations.filter(r=>r.arrivee<=ds && r.depart>=ds && ['confirmee','checkin'].includes(r.statut)).length;
    vals.push(db.chambres.length?Math.round(active/db.chambres.length*100):0);
  }
  const ctxO = document.getElementById('occupTrendChart');
  if(occupTrendChart) occupTrendChart.destroy();
  if(ctxO){
    occupTrendChart = new Chart(ctxO,{
      type:'line',
      data:{labels:days,datasets:[{label:'Occupation %',data:vals,borderColor:'#23715F',backgroundColor:'rgba(35,113,95,0.15)',fill:true,tension:0.35}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{max:100,ticks:{callback:v=>v+'%'}}}}
    });
  }
}
function exportRapports(){
  const {start,end} = getPeriodDates();
  const facts = db.factures.filter(f=>{const d=new Date(f.date);return d>=start&&d<=end});
  let csv = 'N° Facture,Date,Client,Type,Total,Payé,Statut\n';
  facts.forEach(f=>{
    const c = db.clients.find(x=>x.id===f.clientId);
    csv += `${f.numero},${f.date},"${c?c.prenom+' '+c.nom:(f.clientNom||'')}",${f.type},${f.total},${f.paye},${f.statut}\n`;
  });
  downloadFile('rapport_recettes.csv',csv);
}
function downloadFile(name,content){
  content=content.replace(/((?:^|[,;\n])"?)([\t ]*[=+@]|[\t ]*-(?!\d))/g,"$1'$2");
  const blob = new Blob([content],{type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;a.download=name;a.click();
  URL.revokeObjectURL(url);
}

// ============ PARAMETRES ============
function switchParamTab(tab){
  document.querySelectorAll('[data-partab]').forEach(t=>t.classList.remove('active'));
  document.querySelector(`[data-partab="${tab}"]`).classList.add('active');
  ['general','users','moncompte','data'].forEach(t=>{
    document.getElementById('param-'+t).style.display = t===tab?'block':'none';
  });
}
async function changerMonMotDePasse(e){
  e.preventDefault();
  const p1 = document.getElementById('pwNouveau').value;
  const p2 = document.getElementById('pwConfirme').value;
  if(p1.length<8){ toast('8 caractères minimum','warning'); return; }
  if(p1!==p2){ toast('Les deux mots de passe ne correspondent pas','warning'); return; }
  const { error } = await sb.auth.updateUser({ password: p1 });
  if(error){ toast('Erreur : '+error.message,'danger'); return; }
  document.getElementById('pwForm').reset();
  toast('Mot de passe changé');
}
function reinitialiserMotDePasse(userId, nom='cet utilisateur'){
  if(!requireManager())return;
  openModal('Réinitialiser le mot de passe',`
    <p>Nouveau mot de passe pour <strong>${escapeHtml(nom)}</strong> :</p>
    <form id="rpForm" onsubmit="confirmerReinitialisation(event,'${escapeInline(userId)}')">
      <div class="form-group"><input type="password" class="form-control" id="rpNouveau" required minlength="8" placeholder="8 caractères minimum" autofocus></div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('rpForm').requestSubmit()">Réinitialiser</button>`);
}
async function confirmerReinitialisation(e, userId){
  e.preventDefault();
  const nouveau = document.getElementById('rpNouveau').value;
  if(nouveau.length<8){ toast('8 caractères minimum','warning'); return; }
  const { error } = await sb.functions.invoke('reset-password', { body:{ userId, newPassword: nouveau } });
  if(error){ toast('Erreur : '+(error.message||'réinitialisation impossible'),'danger'); return; }
  closeModal();
  toast('Mot de passe réinitialisé');
}
function renderConfig(){
  const c = db.config;
  const map = {Nom:'nom',Raison:'raison',Slogan:'slogan',Adresse:'adresse',Ville:'ville',
               Tel:'tel',Email:'email',Site:'site',Nif:'nif',Rccm:'rccm',
               Agrement:'agrement',Bcb:'bcb',Tva:'tva',Devise:'devise',Seuil:'seuilRemise'};
  Object.entries(map).forEach(([k,v])=>{
    const el = document.getElementById('cfg'+k);
    if(el) el.value = c[v] || '';
  });
}
function saveConfig(){
  const rate=Number(document.getElementById('cfgTva').value);if(!Number.isFinite(rate)||rate<0||rate>100){toast('Taux TVA invalide','warning');return;}
  Object.assign(db.config, {
    nom:document.getElementById('cfgNom').value,
    raison:document.getElementById('cfgRaison').value,
    slogan:document.getElementById('cfgSlogan').value,
    adresse:document.getElementById('cfgAdresse').value,
    ville:document.getElementById('cfgVille').value,
    tel:document.getElementById('cfgTel').value,
    email:document.getElementById('cfgEmail').value,
    site:document.getElementById('cfgSite').value,
    nif:document.getElementById('cfgNif').value,
    rccm:document.getElementById('cfgRccm').value,
    agrement:document.getElementById('cfgAgrement').value,
    bcb:document.getElementById('cfgBcb').value,
    tva:Number(document.getElementById('cfgTva').value),
    devise:document.getElementById('cfgDevise').value,
    seuilRemise:Number(document.getElementById('cfgSeuil').value)
  });
  saveDB();toast('Configuration enregistrée');
}
async function renderUsers(){
  const el = document.getElementById('usersTable');
  if(!el) return;
  el.innerHTML = '<tr><td colspan="5">Chargement…</td></tr>';
  const { data, error } = await safeQuery(sb.from('profiles').select('id,nom,email,role,actif').order('nom'));
  if(error){ el.innerHTML = `<tr><td colspan="5">Impossible de charger la liste (${escapeHtml(error.message)})</td></tr>`; return; }
  el.innerHTML = data.map(u=>`
    <tr>
      <td>${u.email ? escapeHtml(u.email.replace('@hotelsoonre.local','')) : '<span class="text-muted">—</span>'}</td>
      <td><strong>${escapeHtml(u.nom)}</strong></td>
      <td><span class="badge badge-neutral">${escapeHtml(u.role)}</span></td>
      <td>${statutBadge(u.actif?'actif':'inactif')}</td>
      <td>${canManageProfile(u)?`<button class="btn btn-sm btn-ghost" onclick="editUser('${escapeInline(u.id)}')">✎ Modifier</button>`:''}<button class="btn btn-sm btn-ghost" onclick="reinitialiserMotDePasse('${escapeInline(u.id)}')">🔑 Réinitialiser</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5">Aucun compte pour l\'instant</td></tr>';
}
function openUserModal(){
  if(!requireManager())return;
  const rolesDisponibles = db.currentUser.role==='Super Administrateur'?['Directeur Général','Gérant','Accueil / Réception','Ménage','Maintenance']:db.currentUser.role==='Directeur Général'?['Gérant','Accueil / Réception','Ménage','Maintenance']:['Accueil / Réception','Ménage','Maintenance'];
  openModal('Nouvel utilisateur',`
    <form id="usForm" onsubmit="saveUser(event)">
      <div class="form-grid">
        <div class="form-group"><label>Identifiant de connexion *</label><input class="form-control" id="usLogin" required placeholder="ex : reception2"></div>
        <div class="form-group"><label>Mot de passe * (8 caractères min.)</label><input type="password" class="form-control" id="usPass" required minlength="8"></div>
        <div class="form-group"><label>Nom complet *</label><input class="form-control" id="usNom" required></div>
        <div class="form-group full"><label>Rôle *</label>
          <select class="form-control" id="usRole">${rolesDisponibles.map(r=>`<option>${escapeHtml(r)}</option>`).join('')}</select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('usForm').requestSubmit()">💾 Créer le compte</button>`);
}
async function saveUser(e){
  e.preventDefault();
  if(!requireManager())return;
  const login = document.getElementById('usLogin').value.trim();
  const password = document.getElementById('usPass').value;
  const nom = document.getElementById('usNom').value.trim();
  const role = document.getElementById('usRole').value;
  if(!login || password.length<8 || !nom){ toast('Vérifie les champs (mot de passe : 8 caractères minimum)','warning'); return; }

  const { data, error } = await sb.functions.invoke('create-user', { body:{ login, password, nom, role, hotel_id:db.hotelId } });
  if(error){ toast('Erreur : '+(error.message||'création impossible'),'danger'); return; }
  closeModal();
  toast('Compte créé pour '+nom);
  renderUsers();
}
function canManageProfile(user){
 const rank=role=>({'Super Administrateur':4,'Directeur Général':3,'Gérant':2,'Accueil / Réception':1,'Ménage':1,'Maintenance':1}[role]||0);
 return isManager()&&user.id!==db.currentUser.id&&rank(user.role)<rank(db.currentUser.role);
}
async function editUser(id){
 if(!requireManager())return;
 const {data:user,error}=await sb.from('profiles').select('id,nom,role,actif').eq('id',id).single();
 if(error||!user||!canManageProfile(user)){toast('Gestion de ce compte non autorisée','warning');return;}
 const roles=['Directeur Général','Gérant','Accueil / Réception','Ménage','Maintenance'].filter(role=>canManageProfile({id,role}));
 openModal('Modifier le compte',`<form id="editUserForm" onsubmit="saveEditedUser(event,'${escapeInline(id)}')"><div class="form-group"><label>Nom complet</label><input id="editUserName" class="form-control" maxlength="200" required value="${escapeHtml(user.nom)}"></div><div class="form-group"><label>Rôle</label><select id="editUserRole" class="form-control">${roles.map(role=>`<option ${role===user.role?'selected':''}>${escapeHtml(role)}</option>`).join('')}</select></div><label><input type="checkbox" id="editUserActive" ${user.actif?'checked':''}> Compte actif</label></form>`,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="document.getElementById('editUserForm').requestSubmit()">Enregistrer</button>`);
}
async function saveEditedUser(event,id){
 event.preventDefault();if(!requireManager())return;
 const {error}=await callServerRPC('modifier_utilisateur',{p_id:id,p_nom:document.getElementById('editUserName').value.trim(),p_role:document.getElementById('editUserRole').value,p_actif:document.getElementById('editUserActive').checked});
 if(error){toast('Compte non modifié : '+error.message,'danger');return;}closeModal();await renderUsers();toast('Compte mis à jour');
}

function exportSnapshot(){return Object.fromEntries(IMPORT_KEYS.filter(key=>Object.hasOwn(db,key)).map(key=>[key,structuredClone(db[key])]));}
async function exportData(){
 if(!requireManager())return;
 await queueCloudSync();const data=exportSnapshot();
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='soonre-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast(window.hotelSyncPending?'Copie locale exportée : certaines modifications attendent la sauvegarde serveur':'Données métier exportées ; les comptes et mots de passe sont gérés séparément',window.hotelSyncPending?'warning':'success');
}
function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev=>{
    try{
      const data = JSON.parse(ev.target.result);
      if(!confirm('Cette action remplacera toutes les données actuelles. Continuer ?')) return;
      if(!requireManager())return;
      validateImport(data);
      for(const key of IMPORT_KEYS)if(Object.hasOwn(data,key))db[key]=data[key];
      saveDB();await queueCloudSync();
      if(!window.hotelSyncPending){renderAll();toast('Données importées et sauvegardées');}
    }catch(err){toast('Fichier invalide : '+err.message,'error')}
  };
  reader.readAsText(file);
}
function resetData(){
  if(!confirm('⚠ ATTENTION : Le cache de ce navigateur sera effacé. Les données serveur seront conservées. Continuer ?')) return;
  if(!confirm('Êtes-vous vraiment sûr ? Cette action est irréversible.')) return;
  localStorage.removeItem(STORE_KEY);
  location.reload();
}



// ============================================================
// ============ MAGASINS (Location) ============
// ============================================================
function renderMagasins(){
  const st = document.getElementById('magFilter')?.value||'';
  const list = db.magasins.filter(m=>!st || m.statut===st);
  document.getElementById('magTotal').textContent = db.magasins.length;
  document.getElementById('magLoues').textContent = db.magasins.filter(m=>m.statut==='loue').length;
  document.getElementById('magLibres').textContent = db.magasins.filter(m=>m.statut==='libre').length;
  const rec = db.magasins.filter(m=>m.statut==='loue').reduce((s,m)=>s+(m.tarifMensuel||0),0);
  document.getElementById('magRecette').textContent = fmt(rec);

  document.getElementById('magasinsTable').innerHTML = list.length ? list.map(m=>`
    <tr>
      <td><strong>${escapeHtml(m.numero)}</strong></td>
      <td>${escapeHtml(m.designation)}</td>
      <td>${escapeHtml(m.superficie||0)} m²</td>
      <td>${escapeHtml(fmt(m.tarifMensuel))}</td>
      <td>${m.statut==='loue'?'<span class="badge badge-success">Loué</span>':'<span class="badge badge-info">Libre</span>'}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editMagasin('${escapeInline(m.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMagasin('${escapeInline(m.id)}')">×</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6" class="empty">Aucun magasin</td></tr>`;
}
function openMagasinModal(id){
  const m = id?db.magasins.find(x=>x.id===id):null;
  openModal(id?'Modifier magasin':'Nouveau magasin',`
    <form id="magForm" onsubmit="saveMagasin(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>N° / Code *</label><input class="form-control" id="mgNum" required value="${escapeHtml(m?m.numero:'')}"></div>
        <div class="form-group"><label>Désignation *</label><input class="form-control" id="mgDes" required value="${escapeHtml(m?m.designation:'')}"></div>
        <div class="form-group"><label>Superficie (m²)</label><input type="number" class="form-control" id="mgSup" value="${escapeHtml(m?m.superficie:15)}" min="1"></div>
        <div class="form-group"><label>Tarif mensuel (FCFA)</label><input type="number" class="form-control" id="mgTar" value="${escapeHtml(m?m.tarifMensuel:25000)}" min="0"></div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="mgSt">
            <option value="libre" ${escapeHtml(m&&m.statut==='libre'?'selected':'')}>Libre</option>
            <option value="loue" ${escapeHtml(m&&m.statut==='loue'?'selected':'')}>Loué</option>
          </select>
        </div>
        <div class="form-group full"><label>Note</label><textarea class="form-control" id="mgNote">${escapeHtml(m?m.note||'':'')}</textarea></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('magForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveMagasin(e,id){
  e.preventDefault();
  const data = {
    numero:document.getElementById('mgNum').value,
    designation:document.getElementById('mgDes').value,
    superficie:parseInt(document.getElementById('mgSup').value)||0,
    tarifMensuel:parseFloat(document.getElementById('mgTar').value)||0,
    statut:document.getElementById('mgSt').value,
    note:document.getElementById('mgNote').value
  };
  if(id) Object.assign(db.magasins.find(x=>x.id===id),data);
  else db.magasins.push({id:uid('mg'),...data});
  saveDB();closeModal();renderMagasins();toast('Enregistré');
}
function editMagasin(id){openMagasinModal(id)}
function deleteMagasin(id){
  confirmDialog('Supprimer ce magasin ?',()=>{
    db.magasins = db.magasins.filter(x=>x.id!==id);
    saveDB();renderMagasins();toast('Supprimé','warning');
  });
}
function openLocationModal(id){
  const l = id?db.locationsMagasin.find(x=>x.id===id):null;
  const magOpts = db.magasins.map(m=>`<option value="${escapeHtml(m.id)}" ${escapeHtml(l&&l.magasinId===m.id?'selected':'')}>${escapeHtml(m.numero)} — ${escapeHtml(m.designation)}</option>`).join('');
  openModal(id?'Modifier location':'Nouvelle location',`
    <form id="locForm" onsubmit="saveLocation(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Magasin *</label><select class="form-control" id="loMag" required>${magOpts}</select></div>
        <div class="form-group"><label>Locataire *</label><input class="form-control" id="loNom" required value="${escapeHtml(l?l.locataire:'')}"></div>
        <div class="form-group"><label>Téléphone</label><input class="form-control" id="loTel" value="${escapeHtml(l?l.tel||'':'')}"></div>
        <div class="form-group"><label>Date début</label><input type="date" class="form-control" id="loDeb" value="${escapeHtml(l?l.dateDebut:new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Loyer mensuel</label><input type="number" class="form-control" id="loLoy" value="${escapeHtml(l?l.loyer:0)}" min="0"></div>
        <div class="form-group"><label>Caution</label><input type="number" class="form-control" id="loCau" value="${escapeHtml(l?l.caution||0:0)}" min="0"></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('locForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveLocation(e,id){
  e.preventDefault();
  const data = {
    magasinId:document.getElementById('loMag').value,
    locataire:document.getElementById('loNom').value,
    tel:document.getElementById('loTel').value,
    dateDebut:document.getElementById('loDeb').value,
    loyer:parseFloat(document.getElementById('loLoy').value)||0,
    caution:parseFloat(document.getElementById('loCau').value)||0,
    statut:'actif'
  };
  if(id) Object.assign(db.locationsMagasin.find(x=>x.id===id),data);
  else {
    data.id = uid('lm');
    data.numero = 'LOC-'+(1000+db.locationsMagasin.length);
    db.locationsMagasin.push(data);
    // Marquer magasin comme loué
    const m = db.magasins.find(x=>x.id===data.magasinId);
    if(m){m.statut='loue';m.tarifMensuel=data.loyer||m.tarifMensuel;}
  }
  saveDB();closeModal();renderMagasins();renderLocations();toast('Location enregistrée');
}
function renderLocations(){
  const list = db.locationsMagasin.filter(l=>l.statut==='actif');
  document.getElementById('locationsTable').innerHTML = list.length ? list.map(l=>{
    const m = db.magasins.find(x=>x.id===l.magasinId);
    return `<tr>
      <td><strong>${escapeHtml(l.numero)}</strong></td>
      <td>${escapeHtml(m?m.designation:'-')}</td>
      <td>${escapeHtml(l.locataire)}<br><small>${escapeHtml(l.tel||'')}</small></td>
      <td>${escapeHtml(fmtDate(l.dateDebut))}</td>
      <td>${escapeHtml(fmt(l.loyer))}</td>
      <td><span class="badge badge-success">Actif</span></td>
      <td>
        <button class="btn btn-sm btn-gold" onclick="genererLoyerLoc('${escapeInline(l.id)}')">💰 Loyer</button>
        <button class="btn btn-sm btn-danger" onclick="cloturerLoc('${escapeInline(l.id)}')">Clôturer</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="7" class="empty">Aucune location active</td></tr>`;
}
function genererLoyerLoc(id){
  const l = db.locationsMagasin.find(x=>x.id===id);
  const m = db.magasins.find(x=>x.id===l.magasinId);
  const today = new Date().toISOString().slice(0,10);
  const invoiceId='LOYER-'+id+'-'+today.slice(0,7);if(db.factures.some(f=>f.id===invoiceId)){toast('Le loyer de ce mois est déjà facturé','warning');return;}
  db.factures.push({
    id:invoiceId,
    numero:'FAC-MAG-'+(5000+db.factures.filter(f=>f.type==='magasin').length),
    date:today,
    clientNom:l.locataire,
    type:'magasin',
    lignes:[{designation:'Loyer '+(m?m.designation:''),qte:1,pu:l.loyer,total:l.loyer}],
    totalHT:l.loyer,tva:0,total:l.loyer,paye:0,statut:'impaye'
  });
  saveDB();toast('Facture de loyer générée');
}
function cloturerLoc(id){
  confirmDialog('Clôturer ce contrat ?',()=>{
    const l = db.locationsMagasin.find(x=>x.id===id);
    l.statut='cloture';
    const m = db.magasins.find(x=>x.id===l.magasinId);
    if(m) m.statut='libre';
    saveDB();renderMagasins();renderLocations();toast('Contrat clôturé','warning');
  });
}

// ============================================================
// ============ STOCK & ALERTES ============
// ============================================================
function stockAlerts(){
  const faibles = db.stock.filter(s=>s.quantite<=s.seuilAlerte);
  const today = new Date();
  const perimes = db.stock.filter(s=>{
    if(!s.datePeremption) return false;
    const d = new Date(s.datePeremption);
    const diff = (d-today)/(86400000);
    return diff <= 7;
  });
  return {faibles, perimes};
}
function renderStock(){
  const q = (document.getElementById('stockSearch')?.value||'').toLowerCase();
  const cat = document.getElementById('stockCat')?.value||'';
  let list = db.stock.filter(s=>{
    if(cat && s.categorie!==cat) return false;
    if(q && !s.designation.toLowerCase().includes(q)) return false;
    return true;
  });
  const {faibles, perimes} = stockAlerts();
  document.getElementById('stkTotal').textContent = db.stock.length;
  document.getElementById('stkFaible').textContent = faibles.length;
  document.getElementById('stkPerimes').textContent = perimes.length;
  const val = db.stock.reduce((s,x)=>s+x.quantite*x.prixUnitaire,0);
  document.getElementById('stkValeur').textContent = fmt(val);

  // Alertes visuelles
  let alertsHtml = '';
  if(faibles.length){
    alertsHtml += `<div class="card" style="border-left:4px solid var(--danger);margin-bottom:12px">
      <div class="card-header"><h3 style="color:var(--danger)">⚠ Stock faible (${escapeHtml(faibles.length)})</h3></div>
      <div style="padding:4px 0">${faibles.map(f=>`<span class="badge" style="background:#fee;color:#a00;margin:3px">${escapeHtml(f.designation)} : ${escapeHtml(f.quantite)}/${escapeHtml(f.seuilAlerte)} ${escapeHtml(f.unite)}</span>`).join('')}</div>
    </div>`;
  }
  if(perimes.length){
    alertsHtml += `<div class="card" style="border-left:4px solid var(--danger);margin-bottom:12px">
      <div class="card-header"><h3 style="color:var(--danger)">⏰ Péremption proche (${escapeHtml(perimes.length)})</h3></div>
      <div style="padding:4px 0">${perimes.map(f=>`<span class="badge" style="background:#fee;color:#a00;margin:3px">${escapeHtml(f.designation)} : ${escapeHtml(fmtDate(f.datePeremption))}</span>`).join('')}</div>
    </div>`;
  }
  document.getElementById('stkAlerts').innerHTML = alertsHtml;

  document.getElementById('stockTable').innerHTML = list.length ? list.map(s=>{
    const faible = s.quantite<=s.seuilAlerte;
    const perime = s.datePeremption && (new Date(s.datePeremption)-new Date())/86400000 <= 7;
    return `<tr style="${escapeHtml(faible||perime?'background:#fff8f0':'')}">
      <td><strong>${escapeHtml(s.designation)}</strong>${escapeHtml(faible?' ⚠':'')}${escapeHtml(perime?' ⏰':'')}</td>
      <td>${escapeHtml(s.categorie)}</td>
      <td>${escapeHtml(s.unite)}</td>
      <td style="font-weight:700;${escapeHtml(faible?'color:var(--danger)':'')}">${escapeHtml(s.quantite)}</td>
      <td>${escapeHtml(s.seuilAlerte)}</td>
      <td>${escapeHtml(fmt(s.prixUnitaire))}</td>
      <td>${escapeHtml(fmt(s.quantite*s.prixUnitaire))}</td>
      <td>${escapeHtml(s.datePeremption?fmtDate(s.datePeremption):'—')}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editStock('${escapeInline(s.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStock('${escapeInline(s.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" class="empty">Aucun article</td></tr>`;
}
function openStockModal(id){
  const s = id?db.stock.find(x=>x.id===id):null;
  openModal(id?'Modifier article':'Nouvel article',`
    <form id="stkForm" onsubmit="saveStock(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Désignation *</label><input class="form-control" id="stDes" required value="${escapeHtml(s?s.designation:'')}"></div>
        <div class="form-group"><label>Catégorie</label>
          <select class="form-control" id="stCat">
            ${['Alimentation','Boissons','Entretien','Textile','Autre'].map(c=>`<option ${escapeHtml(s&&s.categorie===c?'selected':'')}>${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Unité</label><input class="form-control" id="stUn" value="${escapeHtml(s?s.unite:'pièce')}"></div>
        <div class="form-group"><label>Quantité</label><input type="number" class="form-control" id="stQt" value="${escapeHtml(s?s.quantite:0)}" min="0"></div>
        <div class="form-group"><label>Seuil d'alerte</label><input type="number" class="form-control" id="stSe" value="${escapeHtml(s?s.seuilAlerte:5)}" min="0"></div>
        <div class="form-group"><label>Prix unitaire (FCFA)</label><input type="number" class="form-control" id="stPu" value="${escapeHtml(s?s.prixUnitaire:0)}" min="0"></div>
        <div class="form-group"><label>Date de péremption</label><input type="date" class="form-control" id="stPer" value="${escapeHtml(s?s.datePeremption||'':'')}"></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('stkForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveStock(e,id){
  e.preventDefault();
  const data = {
    designation:document.getElementById('stDes').value,
    categorie:document.getElementById('stCat').value,
    unite:document.getElementById('stUn').value,
    quantite:parseFloat(document.getElementById('stQt').value)||0,
    seuilAlerte:parseFloat(document.getElementById('stSe').value)||0,
    prixUnitaire:parseFloat(document.getElementById('stPu').value)||0,
    datePeremption:document.getElementById('stPer').value||null
  };
  if(id) Object.assign(db.stock.find(x=>x.id===id),data);
  else db.stock.push({id:uid('st'),dateEntree:new Date().toISOString().slice(0,10),...data});
  saveDB();closeModal();renderStock();toast('Enregistré');
}
function editStock(id){openStockModal(id)}
function deleteStock(id){
  confirmDialog('Supprimer cet article ?',()=>{
    db.stock = db.stock.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB();renderStock();toast('Supprimé','warning');
  });
}
function openMouvStockModal(){
  const opts = db.stock.map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.designation)} (${escapeHtml(s.quantite)} ${escapeHtml(s.unite)})</option>`).join('');
  openModal('Mouvement de stock',`
    <form id="mvForm" onsubmit="saveMouvStock(event)">
      <div class="form-grid">
        <div class="form-group full"><label>Article *</label><select class="form-control" id="mvArt" required>${opts}</select></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="mvType">
            <option value="entree">Entrée (+)</option>
            <option value="sortie">Sortie (−)</option>
          </select>
        </div>
        <div class="form-group"><label>Quantité</label><input type="number" class="form-control" id="mvQt" required min="1"></div>
        <div class="form-group full"><label>Motif</label><input class="form-control" id="mvMotif" placeholder="Achat, consommation restaurant..."></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('mvForm').requestSubmit()">💾 Valider</button>`);
}
function saveMouvStock(e){
  e.preventDefault();
  const s = db.stock.find(x=>x.id===document.getElementById('mvArt').value);
  const q = parseFloat(document.getElementById('mvQt').value)||0;
  const type = document.getElementById('mvType').value;
  const motif = document.getElementById('mvMotif').value;
  if(!s||!Number.isFinite(q)||q<=0||!['entree','sortie'].includes(type)||(type==='sortie'&&q>s.quantite)){toast('Quantité invalide ou stock insuffisant','warning');return;}
  if(type==='entree')s.quantite+=q;else s.quantite-=q;
  db.mouvementsStock.push({id:uid('ms'),date:new Date().toISOString().slice(0,10),articleId:s.id,type,quantite:q,motif});
  saveDB();closeModal();renderStock();toast('Mouvement enregistré');
}
function exportStock(){
  let csv = 'Désignation,Catégorie,Unité,Quantité,Seuil,PU,Valeur,Péremption\n';
  db.stock.forEach(s=>{
    csv += `"${s.designation}",${s.categorie},${s.unite},${s.quantite},${s.seuilAlerte},${s.prixUnitaire},${s.quantite*s.prixUnitaire},${s.datePeremption||''}\n`;
  });
  downloadFile('inventaire_stock.csv',csv);
}

// ============================================================
// ============ POINTAGE & PERMANENCES ============
// ============================================================
function initPointagePage(){
  const el = document.getElementById('ptDate');
  if(el && !el.value) el.value = new Date().toISOString().slice(0,10);
}
function switchPtTab(tab){
  document.querySelectorAll('[data-ptab]').forEach(t=>t.classList.toggle('active',t.dataset.ptab===tab));
  document.getElementById('pt-pointage').style.display = tab==='pointage'?'block':'none';
  document.getElementById('pt-permanence').style.display = tab==='permanence'?'block':'none';
}
function calcDuree(ar, dep){
  if(!ar||!dep) return '—';
  const [ah,am] = ar.split(':').map(Number);
  const [dh,dm] = dep.split(':').map(Number);
  let mins = (dh*60+dm) - (ah*60+am);
  if(mins<0) mins += 24*60;
  return Math.floor(mins/60)+'h'+String(mins%60).padStart(2,'0');
}
function renderPointage(){
  const ds = document.getElementById('ptDate')?.value || new Date().toISOString().slice(0,10);
  const list = db.pointages.filter(p=>p.date===ds);
  document.getElementById('pointageTable').innerHTML = list.length ? list.map(p=>{
    const emp = db.personnel.find(x=>x.id===p.personnelId);
    return `<tr>
      <td><strong>${escapeHtml(emp?emp.matricule||'—':'')}</strong></td>
      <td>${escapeHtml(emp?emp.prenom+' '+emp.nom:'—')}</td>
      <td>${escapeHtml(emp?emp.service:'')}</td>
      <td style="color:var(--success);font-weight:600">${escapeHtml(p.arrivee)}</td>
      <td style="color:var(--brown-dark);font-weight:600">${escapeHtml(p.depart||'—')}</td>
      <td><strong>${escapeHtml(calcDuree(p.arrivee,p.depart))}</strong></td>
      <td>${escapeHtml(p.shift==='nuit'?'🌙 Nuit':'☀ Jour')}</td>
      <td>${escapeHtml(p.note||'—')}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editPointage('${escapeInline(p.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deletePointage('${escapeInline(p.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" class="empty">Aucun pointage pour cette date</td></tr>`;
}
function openPointageModal(id){
  const p = id?db.pointages.find(x=>x.id===id):null;
  const opts = db.personnel.map(e=>`<option value="${escapeHtml(e.id)}" ${escapeHtml(p&&p.personnelId===e.id?'selected':'')}>${escapeHtml(e.matricule||'')} — ${escapeHtml(e.prenom)} ${escapeHtml(e.nom)}</option>`).join('');
  const ds = document.getElementById('ptDate')?.value || new Date().toISOString().slice(0,10);
  openModal(id?'Modifier pointage':'Nouveau pointage',`
    <form id="ptForm" onsubmit="savePointage(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Employé *</label><select class="form-control" id="ptEmp" required>${opts}</select></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-control" id="ptDt" value="${escapeHtml(p?p.date:ds)}"></div>
        <div class="form-group"><label>Shift</label>
          <select class="form-control" id="ptSh">
            <option value="jour" ${escapeHtml(p&&p.shift==='jour'?'selected':'')}>Jour (07h-19h)</option>
            <option value="nuit" ${escapeHtml(p&&p.shift==='nuit'?'selected':'')}>Nuit (19h-07h)</option>
          </select>
        </div>
        <div class="form-group"><label>Arrivée</label><input type="time" class="form-control" id="ptAr" value="${escapeHtml(p?p.arrivee:'')}"></div>
        <div class="form-group"><label>Départ</label><input type="time" class="form-control" id="ptDe" value="${escapeHtml(p?p.depart:'')}"></div>
        <div class="form-group full"><label>Note</label><input class="form-control" id="ptNt" value="${escapeHtml(p?p.note||'':'')}"></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('ptForm').requestSubmit()">💾 Enregistrer</button>`);
}
function savePointage(e,id){
  e.preventDefault();
  const data = {
    personnelId:document.getElementById('ptEmp').value,
    date:document.getElementById('ptDt').value,
    shift:document.getElementById('ptSh').value,
    arrivee:document.getElementById('ptAr').value,
    depart:document.getElementById('ptDe').value,
    note:document.getElementById('ptNt').value
  };
  if(id) Object.assign(db.pointages.find(x=>x.id===id),data);
  else db.pointages.push({id:uid('pt'),...data});
  saveDB();closeModal();renderPointage();toast('Enregistré');
}
function editPointage(id){openPointageModal(id)}
function deletePointage(id){
  confirmDialog('Supprimer ce pointage ?',()=>{
    db.pointages = db.pointages.filter(x=>x.id!==id);
    saveDB();renderPointage();toast('Supprimé','warning');
  });
}
function pointerTous(){
  const ds = document.getElementById('ptDate')?.value || new Date().toISOString().slice(0,10);
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  let added = 0;
  db.personnel.filter(p=>p.actif).forEach(p=>{
    const exists = db.pointages.find(x=>x.date===ds && x.personnelId===p.id);
    if(!exists){
      const isNuit = p.service.includes('Sécurité') || p.service.includes('Nuit');
      db.pointages.push({
        id:uid('pt'),date:ds,personnelId:p.id,
        arrivee: isNuit?'19:00':h, depart:'', shift: isNuit?'nuit':'jour', note:''
      });
      added++;
    }
  });
  saveDB();renderPointage();
  toast(added+' pointage(s) créé(s)');
}
function renderPermanences(){
  const jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  const shifts = [{k:'jour',lib:'07h - 19h'},{k:'nuit',lib:'19h - 07h'}];
  document.getElementById('permanenceTable').innerHTML = shifts.map(s=>{
    let row = `<tr><td><strong>${escapeHtml(s.lib)}</strong></td>`;
    jours.forEach(j=>{
      const p = db.permanences.find(x=>x.jour===j && x.shift===s.k);
      const emp = p?db.personnel.find(e=>e.id===p.personnelId):null;
      row += `<td style="cursor:pointer" onclick="setPermanence('${escapeInline(j)}','${escapeInline(s.k)}')">${emp?escapeHtml(emp.prenom+' '+emp.nom):'<span style="color:var(--muted);font-style:italic">+ Assigner</span>'}</td>`;
    });
    return row + '</tr>';
  }).join('');
}
function setPermanence(jour,shift){
  const opts = db.personnel.map(e=>`<option value="${escapeHtml(e.id)}">${escapeHtml(e.prenom)} ${escapeHtml(e.nom)} (${escapeHtml(e.service)})</option>`).join('');
  const existing = db.permanences.find(x=>x.jour===jour && x.shift===shift);
  openModal(`Permanence ${jour} • ${shift==='jour'?'07h-19h':'19h-07h'}`,`
    <div class="form-group">
      <label>Employé de permanence</label>
      <select class="form-control" id="pmEmp">${opts}</select>
    </div>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     ${existing?`<button class="btn btn-danger" onclick="deletePermanence('${escapeInline(jour)}','${escapeInline(shift)}')">Retirer</button>`:''}
     <button class="btn btn-primary" onclick="savePermanence('${escapeInline(jour)}','${escapeInline(shift)}')">💾 Assigner</button>`);
  if(existing) document.getElementById('pmEmp').value = existing.personnelId;
}
function savePermanence(jour,shift){
  const empId = document.getElementById('pmEmp').value;
  const existing = db.permanences.find(x=>x.jour===jour && x.shift===shift);
  if(existing) existing.personnelId = empId;
  else db.permanences.push({id:uid('pm'),jour,shift,horaire:shift==='jour'?'07h - 19h':'19h - 07h',personnelId:empId});
  saveDB();closeModal();renderPermanences();toast('Permanence assignée');
}
function deletePermanence(jour,shift){
  db.permanences = db.permanences.filter(x=>!(x.jour===jour && x.shift===shift));
  saveDB();closeModal();renderPermanences();toast('Permanence supprimée','warning');
}
function openPermanenceModal(){
  toast('Cliquez directement sur une case du planning pour assigner','info');
}

// ============================================================
// ============ PAIE / BULLETINS ============
// ============================================================
function initPaiePage(){
  const el = document.getElementById('paiePeriode');
  if(el && !el.value){
    const d = new Date();
    el.value = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  }
}
function renderPaie(){
  const p = document.getElementById('paiePeriode')?.value || new Date().toISOString().slice(0,7);
  const list = db.paies.filter(x=>x.periode===p);
  const brute = list.reduce((s,x)=>s+x.salaireBrut,0);
  const nette = list.reduce((s,x)=>s+x.salaireNet,0);
  const cnss = list.reduce((s,x)=>s+x.cnss,0);
  document.getElementById('paieBrute').textContent = fmt(brute);
  document.getElementById('paieNette').textContent = fmt(nette);
  document.getElementById('paieCnss').textContent = fmt(cnss);
  document.getElementById('paieCount').textContent = list.length;

  document.getElementById('paieTable').innerHTML = list.length ? list.map(x=>{
    const emp = db.personnel.find(e=>e.id===x.personnelId);
    const retenues = x.cnss + x.irpp + (x.avances||0);
    return `<tr>
      <td><strong>${escapeHtml(x.numero)}</strong></td>
      <td>${escapeHtml(x.periode)}</td>
      <td>${emp?escapeHtml(emp.prenom)+' '+escapeHtml(emp.nom)+' <br><small style="color:var(--muted)">'+escapeHtml(emp.matricule)+'</small>':escapeHtml('—')}</td>
      <td>${escapeHtml(fmt(x.salaireBrut))}</td>
      <td style="color:var(--danger)">−${escapeHtml(fmt(retenues))}</td>
      <td style="font-weight:700;color:var(--success)">${escapeHtml(fmt(x.salaireNet))}</td>
      <td>${statutBadge(x.statut)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="viewBulletin('${escapeInline(x.id)}')">👁</button>
        <button class="btn btn-sm btn-gold" onclick="imprimerBulletin('${escapeInline(x.id)}')">🖨</button>
        <button class="btn btn-sm btn-danger" onclick="deletePaie('${escapeInline(x.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="8" class="empty">Aucun bulletin pour cette période</td></tr>`;
}
function openPaieModal(id){
  const x = id?db.paies.find(p=>p.id===id):null;
  const opts = db.personnel.filter(e=>e.actif).map(e=>`<option value="${escapeHtml(e.id)}" data-sal="${escapeHtml(e.salaire)}" ${escapeHtml(x&&x.personnelId===e.id?'selected':'')}>${escapeHtml(e.prenom)} ${escapeHtml(e.nom)} (${escapeHtml(e.poste)})</option>`).join('');
  const per = x?x.periode:document.getElementById('paiePeriode').value;
  openModal(id?'Modifier bulletin':'Nouveau bulletin de salaire',`
    <form id="pyForm" onsubmit="savePaie(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Employé *</label>
          <select class="form-control" id="pyEmp" required onchange="autoRemplirSalaire()">${opts}</select>
        </div>
        <div class="form-group"><label>Période (YYYY-MM)</label><input type="month" class="form-control" id="pyPer" value="${escapeHtml(per)}"></div>
        <div class="form-group"><label>Date paiement</label><input type="date" class="form-control" id="pyDt" value="${escapeHtml(x?x.datePaiement:new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Salaire brut</label><input type="number" class="form-control" id="pyBr" value="${escapeHtml(x?x.salaireBrut:0)}" oninput="calcPaie()"></div>
        <div class="form-group"><label>Primes / heures sup.</label><input type="number" class="form-control" id="pyPr" value="${escapeHtml(x?x.primes:0)}" oninput="calcPaie()"></div>
        <div class="form-group"><label>CNSS à retenir (montant validé)</label><input type="number" class="form-control" id="pyCn" min="0" oninput="calcPaie()" value="${escapeHtml(x?x.cnss:0)}"></div>
        <div class="form-group"><label>IRPP</label><input type="number" class="form-control" id="pyIr" min="0" oninput="calcPaie()" value="${escapeHtml(x?x.irpp:0)}"></div>
        <div class="form-group"><label>Avances</label><input type="number" class="form-control" id="pyAv" value="${escapeHtml(x?x.avances||0:0)}" oninput="calcPaie()"></div>
        <div class="form-group"><label>Mode paiement</label>
          <select class="form-control" id="pyMd">
            <option value="virement" ${escapeHtml(x&&x.mode==='virement'?'selected':'')}>Virement</option>
            <option value="espece" ${escapeHtml(x&&x.mode==='espece'?'selected':'')}>Espèces</option>
            <option value="mobile" ${escapeHtml(x&&x.mode==='mobile'?'selected':'')}>Mobile Money</option>
          </select>
        </div>
        <div class="form-group full" style="background:var(--gold-soft);padding:12px;border-radius:8px">
          <label>Salaire net à payer</label>
          <div style="font-size:22px;font-weight:800;color:var(--brown-dark)" id="pyNet">0 FCFA</div>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('pyForm').requestSubmit()">💾 Établir bulletin</button>`);
  setTimeout(()=>{autoRemplirSalaire();calcPaie()},50);
}
function autoRemplirSalaire(){
  const sel = document.getElementById('pyEmp');
  if(!sel) return;
  const opt = sel.selectedOptions[0];
  if(opt && !document.getElementById('pyBr').value){
    const s = parseFloat(opt.dataset.sal)||0;
    document.getElementById('pyBr').value = s;
    calcPaie();
  }
}
function calcPaie(){
  if(!document.getElementById('pyBr')||!document.getElementById('pyCn')||!document.getElementById('pyIr')||!document.getElementById('pyNet'))return;
  const br = parseFloat(document.getElementById('pyBr')?.value)||0;
  const pr = parseFloat(document.getElementById('pyPr')?.value)||0;
  const av = parseFloat(document.getElementById('pyAv')?.value)||0;
  const cn=Number(document.getElementById('pyCn').value)||0;
  const ir=Number(document.getElementById('pyIr').value)||0;
  const net = br+pr-cn-ir-av;
  document.getElementById('pyNet').textContent = fmt(net);
}
function savePaie(e,id){
  e.preventDefault();
  const empId = document.getElementById('pyEmp').value;
  const emp = db.personnel.find(x=>x.id===empId);
  const per = document.getElementById('pyPer').value;
  const br = parseFloat(document.getElementById('pyBr').value)||0;
  const pr = parseFloat(document.getElementById('pyPr').value)||0;
  const cn = parseFloat(document.getElementById('pyCn').value)||0;
  const ir = parseFloat(document.getElementById('pyIr').value)||0;
  const av = parseFloat(document.getElementById('pyAv').value)||0;
  const net = br+pr-cn-ir-av;
  const data = {
    personnelId:empId, periode:per,
    datePaiement:document.getElementById('pyDt').value,
    salaireBrut:br, primes:pr, cnss:cn, irpp:ir, avances:av, salaireNet:net,
    mode:document.getElementById('pyMd').value, statut:'paye'
  };
  const previous=id?db.paies.find(x=>x.id===id):null;
  if(!emp||!/^[0-9]{4}-[0-9]{2}$/.test(per)||[br,pr,cn,ir,av,net].some(n=>!Number.isFinite(n)||n<0)||db.paies.some(p=>p.id!==id&&p.personnelId===empId&&p.periode===per)){toast('Bulletin invalide ou déjà présent pour cette période','warning');return;}
  if(previous?.statut==='paye'){toast('Un bulletin payé ne peut pas être modifié','warning');return;}
  if(data.mode==='espece'&&!sessionActive()){toast('Ouvrez la caisse avant un paiement en espèces','warning');return;}
  if(previous)Object.assign(previous,data);else{data.id=uid('py');data.numero='PAIE-'+per.replace('-','')+'-'+(emp.matricule||emp.id).slice(-4);db.paies.push(data);}
  const payroll=previous||data;
  db.caisse.push({id:uid('cs'),date:data.datePaiement,ref:payroll.numero,description:'Salaire '+emp.prenom+' '+emp.nom,type:'sortie',mode:data.mode,montant:net,sessionId:sessionActive()?.id||null});
  saveDB();closeModal();renderPaie();toast('Bulletin établi');
}
function genererPaieMassive(){
  const per = document.getElementById('paiePeriode').value;
  confirmDialog('Préparer les brouillons de paie, à vérifier avant paiement ('+per+') ?',()=>{
    let count = 0;
    db.personnel.filter(e=>e.actif).forEach(emp=>{
      const exists = db.paies.find(p=>p.personnelId===emp.id && p.periode===per);
      if(exists) return;
      const br = emp.salaire;
      const cn=0,ir=0;
      const net = br-cn-ir;
      db.paies.push({
        id:uid('py'),
        numero:'PAIE-'+per.replace('-','')+'-'+emp.matricule.slice(-4),
        periode:per,
        datePaiement:new Date().toISOString().slice(0,10),
        personnelId:emp.id,
        salaireBrut:br,primes:0,cnss:cn,irpp:ir,avances:0,salaireNet:net,
        mode:'virement',statut:'brouillon'
      });
      count++;
    });
    saveDB();renderPaie();toast(count+' brouillon(s) préparé(s), à vérifier avant paiement');
  });
}
function viewBulletin(id){imprimerBulletin(id)}
function imprimerBulletin(id){
  const x = db.paies.find(p=>p.id===id);
  const emp = db.personnel.find(e=>e.id===x.personnelId);
  const c = db.config;
  const retenues = x.cnss + x.irpp + (x.avances||0);
  const w = window.open('','_blank','width=800,height=900');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bulletin ${escapeHtml(x.numero)} ${x.statut==='brouillon'?'— BROUILLON':''}</title>
    <style>
      body{font-family:'Helvetica',sans-serif;padding:30px;color:#333;font-size:12px}
      h1{color:#5C3A1E;margin:0}
      .head{display:flex;justify-content:space-between;border-bottom:3px solid #D4A017;padding-bottom:12px;margin-bottom:20px}
      .info{background:#FDF8EF;padding:12px;border-radius:6px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{padding:8px 10px;border-bottom:1px solid #eee;text-align:left}
      th{background:#5C3A1E;color:#fff}
      .total{background:#D4A017;color:#fff;font-weight:700;font-size:14px}
      .footer{margin-top:30px;font-size:11px;text-align:center;color:#666}
    </style></head><body>
    <div class="head">
      <div>
        <h1>${escapeHtml(c.raison||c.nom)}</h1>
        <div><strong>${escapeHtml(c.nom)}</strong></div>
        <div>${escapeHtml(c.adresse)}</div>
        <div>${escapeHtml(c.tel)}</div>
        <div>RCCM: ${escapeHtml(c.rccm||'')} • IFU: ${escapeHtml(c.nif||'')}</div>
      </div>
      <div style="text-align:right">
        <h2 style="color:#D4A017;margin:0">BULLETIN DE PAIE</h2>
        <div><strong>N° ${escapeHtml(x.numero)}</strong></div>
        <div>Période : ${escapeHtml(x.periode)}</div>
        <div>Date : ${escapeHtml(fmtDate(x.datePaiement))}</div>
      </div>
    </div>
    <div class="info">
      <strong>Employé : ${escapeHtml(emp.prenom)} ${escapeHtml(emp.nom)}</strong><br>
      Matricule : ${escapeHtml(emp.matricule)} • Poste : ${escapeHtml(emp.poste)} • Service : ${escapeHtml(emp.service)}<br>
      CNSS : ${escapeHtml(emp.cnss||'—')} • Contrat : ${escapeHtml(emp.typeContrat||'CDI')}
    </div>
    <table>
      <thead><tr><th>Rubrique</th><th style="text-align:right">Gain</th><th style="text-align:right">Retenue</th></tr></thead>
      <tbody>
        <tr><td>Salaire de base</td><td style="text-align:right">${escapeHtml(fmt(x.salaireBrut))}</td><td></td></tr>
        ${x.primes?`<tr><td>Primes / Heures sup.</td><td style="text-align:right">${escapeHtml(fmt(x.primes))}</td><td></td></tr>`:''}
        <tr><td>Cotisation CNSS (5.5%)</td><td></td><td style="text-align:right">${escapeHtml(fmt(x.cnss))}</td></tr>
        <tr><td>Impôt IRPP</td><td></td><td style="text-align:right">${escapeHtml(fmt(x.irpp))}</td></tr>
        ${x.avances?`<tr><td>Avances sur salaire</td><td></td><td style="text-align:right">${escapeHtml(fmt(x.avances))}</td></tr>`:''}
        <tr class="total"><td>NET À PAYER</td><td colspan="2" style="text-align:right">${escapeHtml(fmt(x.salaireNet))}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:30px;display:flex;justify-content:space-between">
      <div>Signature Employé<br><br>____________________</div>
      <div>Signature Direction<br><br>____________________</div>
    </div>
    <div class="footer">
      « ${escapeHtml(c.slogan||'')} » — ${escapeHtml(c.nom)} — ${escapeHtml(c.site||'')}
    </div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
}
function deletePaie(id){
  confirmDialog('Supprimer ce bulletin ?',()=>{
    db.paies = db.paies.filter(x=>x.id!==id);
    saveDB();renderPaie();toast('Supprimé','warning');
  });
}



// ============================================================
// ============ COMPTABILITÉ SYSCOHADA / OHADA ============
// ============================================================

// Plan comptable SYSCOHADA de base pour hôtellerie/restauration
const PLAN_COMPTABLE_SYSCOHADA = [
  // Classe 1 - Capitaux
  ['101000','Capital social','1','passif'],
  ['110000','Report à nouveau','1','passif'],
  ['120000','Résultat de l\'exercice','1','passif'],
  ['131000','Subventions d\'investissement','1','passif'],
  ['161000','Emprunts auprès des établissements de crédit','1','passif'],
  // Classe 2 - Immobilisations
  ['211000','Terrains','2','actif'],
  ['213000','Bâtiments','2','actif'],
  ['218100','Matériel et mobilier hôtelier','2','actif'],
  ['218200','Matériel de cuisine et restauration','2','actif'],
  ['218300','Matériel informatique','2','actif'],
  ['245000','Matériel de transport','2','actif'],
  ['281300','Amortissements des bâtiments','2','passif'],
  ['281800','Amortissements du matériel hôtelier','2','passif'],
  // Classe 3 - Stocks
  ['311000','Marchandises','3','actif'],
  ['321000','Matières premières','3','actif'],
  ['331000','Autres approvisionnements','3','actif'],
  ['335100','Emballages','3','actif'],
  // Classe 4 - Tiers
  ['401000','Fournisseurs','4','passif'],
  ['411000','Clients','4','actif'],
  ['421000','Personnel — Rémunérations dues','4','passif'],
  ['422000','Personnel — Avances et acomptes','4','actif'],
  ['431000','CNSS','4','passif'],
  ['441000','État, impôts sur bénéfices','4','passif'],
  ['443000','État, TVA facturée (collectée)','4','passif'],
  ['445000','État, TVA déductible','4','actif'],
  ['447000','État, impôts et taxes recouvrables','4','passif'],
  // Classe 5 - Trésorerie
  ['512000','Banque BCB','5','actif'],
  ['521000','Banques (autres)','5','actif'],
  ['531000','Chèques postaux','5','actif'],
  ['541000','Mobile Money','5','actif'],
  ['571000','Caisse principale','5','actif'],
  // Classe 6 - Charges
  ['601000','Achats de marchandises','6','charge'],
  ['602000','Achats de matières premières (cuisine)','6','charge'],
  ['604000','Achats de fournitures d\'entretien','6','charge'],
  ['605000','Autres achats','6','charge'],
  ['611000','Transports','6','charge'],
  ['614000','Loyers et charges locatives','6','charge'],
  ['624000','Entretien, réparations et maintenance','6','charge'],
  ['625000','Primes d\'assurance','6','charge'],
  ['626000','Études, recherches et documentation','6','charge'],
  ['627000','Publicité, publications, relations publiques','6','charge'],
  ['628000','Frais de télécommunications','6','charge'],
  ['631000','Frais bancaires','6','charge'],
  ['641000','Impôts et taxes directs','6','charge'],
  ['646000','Droits d\'enregistrement','6','charge'],
  ['661000','Rémunérations directes versées au personnel','6','charge'],
  ['664000','Charges sociales (CNSS employeur)','6','charge'],
  ['671000','Frais financiers','6','charge'],
  ['681000','Dotations aux amortissements','6','charge'],
  // Classe 7 - Produits
  ['701000','Ventes de marchandises','7','produit'],
  ['706100','Prestations d\'hébergement','7','produit'],
  ['706200','Recettes de restauration','7','produit'],
  ['706300','Location de salles de conférence','7','produit'],
  ['706400','Location de magasins','7','produit'],
  ['706500','Autres prestations de services','7','produit'],
  ['758000','Autres produits divers','7','produit'],
  ['771000','Produits financiers','7','produit'],
  // Classe 8
  ['848000','Résultat en instance d\'affectation','8','passif']
];

function initPlanComptable(){
  if(db.planComptable.length){
    confirmDialog('Le plan comptable existe déjà. Le réinitialiser ?',()=>{
      db.planComptable = PLAN_COMPTABLE_SYSCOHADA.map(([n,l,c,t])=>({numero:n,libelle:l,classe:c,type:t}));
      saveDB();
      if(document.getElementById('planTable')) renderPlanComptable();
      toast('Plan comptable initialisé — '+db.planComptable.length+' comptes');
    });
  } else {
    db.planComptable = PLAN_COMPTABLE_SYSCOHADA.map(([n,l,c,t])=>({numero:n,libelle:l,classe:c,type:t}));
    saveDB();
    toast('Plan comptable initialisé');
  }
}

function initComptaPage(){
  if(!db.planComptable.length){ initPlanComptable(); }
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const last = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
  ['ecDu','crDu'].forEach(id=>{ const e=document.getElementById(id); if(e && !e.value) e.value=first; });
  ['ecAu','crAu','balDate','blDate'].forEach(id=>{ const e=document.getElementById(id); if(e && !e.value) e.value=last; });
  const mois = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  ['jnMois','tvaMois','clPeriode'].forEach(id=>{ const e=document.getElementById(id); if(e && !e.value) e.value=mois; });
  renderComptaDashboard();
}

function switchCTab(tab){
  document.querySelectorAll('[data-ctab]').forEach(t=>t.classList.toggle('active',t.dataset.ctab===tab));
  document.querySelectorAll('.ctab-content').forEach(c=>c.style.display='none');
  document.getElementById('ctab-'+tab).style.display='block';
  const map = {
    dashboard:renderComptaDashboard, plan:renderPlanComptable, ecritures:renderEcritures,
    journaux:renderJournal, grandlivre:renderGrandLivre, balance:renderBalance,
    resultat:renderResultat, bilan:renderBilan, tva:renderTVA, cloture:renderClotures
  };
  if(map[tab]) map[tab]();
}

function renderComptaDashboard(){
  const prods = db.ecritures.filter(e=>e.compte.startsWith('7')).reduce((s,e)=>s+(e.credit-e.debit),0);
  const chgs = db.ecritures.filter(e=>e.compte.startsWith('6')).reduce((s,e)=>s+(e.debit-e.credit),0);
  document.getElementById('cptProduits').textContent = fmt(prods);
  document.getElementById('cptCharges').textContent = fmt(chgs);
  document.getElementById('cptResultat').textContent = fmt(prods-chgs);
  document.getElementById('cptNbEcr').textContent = db.ecritures.length;
  const derns = [...db.ecritures].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);
  document.getElementById('cptDernieres').innerHTML = derns.length ? derns.map(e=>`
    <tr>
      <td>${escapeHtml(fmtDate(e.date))}</td><td><strong>${escapeHtml(e.piece)}</strong></td>
      <td><span class="badge badge-neutral">${escapeHtml(e.journal)}</span></td>
      <td>${escapeHtml(e.compte)} — ${escapeHtml(e.libelle)}</td>
      <td style="text-align:right;color:var(--success)">${escapeHtml(e.debit?fmt(e.debit):'')}</td>
      <td style="text-align:right;color:var(--danger)">${escapeHtml(e.credit?fmt(e.credit):'')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="empty">Aucune écriture</td></tr>';
}

function renderPlanComptable(){
  const q = (document.getElementById('pcSearch')?.value||'').toLowerCase();
  const cl = document.getElementById('pcClasse')?.value||'';
  const list = db.planComptable.filter(c=>{
    if(cl && c.classe!==cl) return false;
    if(q && !(c.numero+' '+c.libelle).toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=>a.numero.localeCompare(b.numero));
  document.getElementById('planTable').innerHTML = list.length ? list.map(c=>`
    <tr>
      <td><strong>${escapeHtml(c.numero)}</strong></td>
      <td>${escapeHtml(c.libelle)}</td>
      <td>Classe ${escapeHtml(c.classe)}</td>
      <td><span class="badge badge-neutral">${escapeHtml(c.type)}</span></td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editCompte('${escapeInline(c.numero)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCompte('${escapeInline(c.numero)}')">×</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="empty">Aucun compte</td></tr>';
}

function openCompteModal(num){
  const c = num?db.planComptable.find(x=>x.numero===num):null;
  openModal(num?'Modifier compte':'Nouveau compte',`
    <form id="pcForm" onsubmit="saveCompte(event,'${escapeInline(num||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>N° compte *</label><input class="form-control" id="pcNum" required value="${escapeHtml(c?c.numero:'')}" ${escapeHtml(num?'readonly':'')}></div>
        <div class="form-group"><label>Classe *</label>
          <select class="form-control" id="pcCl" required>
            ${[1,2,3,4,5,6,7,8].map(n=>`<option value="${escapeHtml(n)}" ${escapeHtml(c&&c.classe==n?'selected':'')}>Classe ${escapeHtml(n)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full"><label>Libellé *</label><input class="form-control" id="pcLib" required value="${escapeHtml(c?c.libelle:'')}"></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="pcTp">
            ${['actif','passif','charge','produit'].map(t=>`<option ${escapeHtml(c&&c.type===t?'selected':'')}>${escapeHtml(t)}</option>`).join('')}
          </select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('pcForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveCompte(e,num){
  e.preventDefault();
  const data = {
    numero:document.getElementById('pcNum').value,
    libelle:document.getElementById('pcLib').value,
    classe:document.getElementById('pcCl').value,
    type:document.getElementById('pcTp').value
  };
  if(num) Object.assign(db.planComptable.find(x=>x.numero===num),data);
  else db.planComptable.push(data);
  saveDB();closeModal();renderPlanComptable();toast('Enregistré');
}
function editCompte(num){openCompteModal(num)}
function deleteCompte(num){
  const utilise = db.ecritures.some(e=>e.compte===num);
  if(utilise){toast('Compte utilisé dans des écritures — suppression impossible','warning');return}
  confirmDialog('Supprimer ce compte ?',()=>{
    db.planComptable = db.planComptable.filter(c=>c.numero!==num);
    saveDB();renderPlanComptable();toast('Supprimé','warning');
  });
}

// ============ ÉCRITURES ============
function renderEcritures(){
  const q = (document.getElementById('ecSearch')?.value||'').toLowerCase();
  const j = document.getElementById('ecJournal')?.value||'';
  const du = document.getElementById('ecDu')?.value||'';
  const au = document.getElementById('ecAu')?.value||'';
  let list = db.ecritures.filter(e=>{
    if(j && e.journal!==j) return false;
    if(du && e.date<du) return false;
    if(au && e.date>au) return false;
    if(q && !(e.piece+' '+e.libelle+' '+e.compte).toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const totD = list.reduce((s,e)=>s+e.debit,0);
  const totC = list.reduce((s,e)=>s+e.credit,0);
  document.getElementById('ecrituresTable').innerHTML = list.length ? list.map(e=>{
    const cpt = db.planComptable.find(c=>c.numero===e.compte);
    return `<tr>
      <td>${escapeHtml(fmtDate(e.date))}</td>
      <td><strong>${escapeHtml(e.piece)}</strong></td>
      <td><span class="badge badge-neutral">${escapeHtml(e.journal)}</span></td>
      <td><strong>${escapeHtml(e.compte)}</strong><br><small style="color:var(--muted)">${escapeHtml(cpt?cpt.libelle:'')}</small></td>
      <td>${escapeHtml(e.libelle)}</td>
      <td style="text-align:right;color:var(--success);font-weight:600">${escapeHtml(e.debit?fmt(e.debit):'')}</td>
      <td style="text-align:right;color:var(--danger);font-weight:600">${escapeHtml(e.credit?fmt(e.credit):'')}</td>
      <td>
        ${e.auto?'<span style="color:var(--muted);font-size:11px">Auto</span>':escapeHtml('')}
        <button class="btn btn-sm btn-danger" onclick="deleteEcriture('${escapeInline(e.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="empty">Aucune écriture</td></tr>';
  document.getElementById('ecrituresTotaux').innerHTML = `<tr style="background:var(--gold-soft);font-weight:700">
    <td colspan="5" style="text-align:right">TOTAUX</td>
    <td style="text-align:right">${escapeHtml(fmt(totD))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totC))}</td>
    <td>${totD===totC?'<span style="color:var(--success)">✓ Équilibré</span>':'<span style="color:var(--danger)">⚠ Écart '+fmt(totD-totC)+'</span>'}</td>
  </tr>`;
}

function openEcritureModal(){
  const cptOpts = db.planComptable.sort((a,b)=>a.numero.localeCompare(b.numero)).map(c=>`<option value="${escapeHtml(c.numero)}">${escapeHtml(c.numero)} — ${escapeHtml(c.libelle)}</option>`).join('');
  openModal('✍ Nouvelle écriture comptable',`
    <form id="ecForm" onsubmit="saveEcriture(event)">
      <div class="form-grid">
        <div class="form-group"><label>Date *</label><input type="date" class="form-control" id="ecDate" required value="${escapeHtml(new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Journal *</label>
          <select class="form-control" id="ecJn" required>
            <option value="VE">VE — Ventes</option><option value="AC">AC — Achats</option>
            <option value="CA">CA — Caisse</option><option value="BQ">BQ — Banque</option>
            <option value="PA">PA — Paie</option><option value="OD" selected>OD — Opérations diverses</option>
          </select>
        </div>
        <div class="form-group"><label>N° pièce</label><input class="form-control" id="ecPiece" placeholder="Auto si vide"></div>
        <div class="form-group full"><label>Libellé *</label><input class="form-control" id="ecLib" required></div>
      </div>
      <h4 style="margin:16px 0 8px;color:var(--brown-dark)">Lignes d'écriture (équilibre débit = crédit)</h4>
      <div id="ecLignes"></div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="ajouterLigneEc()">+ Ligne</button>
      <div id="ecTotaux" style="margin-top:12px;padding:10px;background:var(--gold-soft);border-radius:6px;font-weight:700">
        Total débit: <span id="ecTotD">0</span> • Total crédit: <span id="ecTotC">0</span> • <span id="ecEcart"></span>
      </div>
    </form>
    <template id="ecLigneTpl">
      <div class="ec-ligne" style="display:grid;grid-template-columns:2fr 2fr 1fr 1fr auto;gap:6px;margin-bottom:6px;align-items:end">
        <div class="form-group" style="margin:0"><label style="font-size:10px">Compte</label>
          <select class="form-control ec-cpt">${cptOpts}</select>
        </div>
        <div class="form-group" style="margin:0"><label style="font-size:10px">Libellé ligne</label>
          <input class="form-control ec-lib">
        </div>
        <div class="form-group" style="margin:0"><label style="font-size:10px">Débit</label>
          <input type="number" class="form-control ec-deb" value="0" oninput="calcEcTotaux()">
        </div>
        <div class="form-group" style="margin:0"><label style="font-size:10px">Crédit</label>
          <input type="number" class="form-control ec-cre" value="0" oninput="calcEcTotaux()">
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove();calcEcTotaux()">×</button>
      </div>
    </template>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('ecForm').requestSubmit()">💾 Valider l'écriture</button>`);
  setTimeout(()=>{ajouterLigneEc();ajouterLigneEc();calcEcTotaux()},50);
}
function ajouterLigneEc(){
  const tpl = document.getElementById('ecLigneTpl');
  const node = tpl.content.cloneNode(true);
  document.getElementById('ecLignes').appendChild(node);
}
function calcEcTotaux(){
  let totD = 0, totC = 0;
  document.querySelectorAll('#ecLignes .ec-ligne').forEach(l=>{
    totD += parseFloat(l.querySelector('.ec-deb').value)||0;
    totC += parseFloat(l.querySelector('.ec-cre').value)||0;
  });
  document.getElementById('ecTotD').textContent = fmt(totD);
  document.getElementById('ecTotC').textContent = fmt(totC);
  const ec = totD - totC;
  document.getElementById('ecEcart').innerHTML = ec===0 ? '<span style="color:var(--success)">✓ Équilibré</span>' : '<span style="color:var(--danger)">⚠ Écart: '+fmt(ec)+'</span>';
}
function saveEcriture(e){
  e.preventDefault();
  const lignes = [...document.querySelectorAll('#ecLignes .ec-ligne')];
  let totD = 0, totC = 0;
  lignes.forEach(l=>{
    totD += parseFloat(l.querySelector('.ec-deb').value)||0;
    totC += parseFloat(l.querySelector('.ec-cre').value)||0;
  });
  if(totD !== totC){toast('Écriture non équilibrée: débit ≠ crédit','warning');return}
  if(totD === 0){toast('Écriture vide','warning');return}
  const date = document.getElementById('ecDate').value;
  const journal = document.getElementById('ecJn').value;
  const libelle = document.getElementById('ecLib').value;
  const piece = document.getElementById('ecPiece').value || journal+'-'+String(db.ecritures.length+1).padStart(5,'0');
  lignes.forEach(l=>{
    const deb = parseFloat(l.querySelector('.ec-deb').value)||0;
    const cre = parseFloat(l.querySelector('.ec-cre').value)||0;
    if(deb===0 && cre===0) return;
    db.ecritures.push({
      id: uid('ec'),
      date, journal, piece, libelle: l.querySelector('.ec-lib').value || libelle,
      compte: l.querySelector('.ec-cpt').value,
      debit: deb, credit: cre,
      auto: false
    });
  });
  saveDB();closeModal();renderEcritures();renderComptaDashboard();toast('Écriture enregistrée');
}
function deleteEcriture(id){
  const e = db.ecritures.find(x=>x.id===id);
  if(e && e.verrouille){toast('Écriture clôturée — non modifiable','warning');return}
  confirmDialog('Supprimer cette ligne ?',()=>{
    db.ecritures = db.ecritures.filter(x=>x.id!==id);
    saveDB();renderEcritures();renderComptaDashboard();toast('Supprimé','warning');
  });
}

// ============ GÉNÉRATION AUTOMATIQUE ============
function genererEcrituresAuto(){
  confirmDialog("Générer les écritures comptables automatiques à partir des factures, mouvements de caisse, bulletins et dépenses non encore comptabilisés ?",()=>{
    let count = 0;
    const tva = db.config.tva/100;

    // 1. Ventes (factures)
    db.factures.forEach(f=>{
      if(f.auto_ecrit) return;
      const compteProd = ({hebergement:'706100',restauration:'706200',salle:'706300',magasin:'706400'})[f.type] || '706500';
      const ht = f.totalHT || f.total;
      const tvaMt = f.tva || 0;
      const total = f.total;
      const piece = f.numero;
      // Débit 411 Clients / Crédit 706 Produits + 443 TVA
      db.ecritures.push({id:uid('ec'),date:f.date,journal:'VE',piece,libelle:'Facture '+f.numero,compte:'411000',debit:total,credit:0,auto:true});
      db.ecritures.push({id:uid('ec'),date:f.date,journal:'VE',piece,libelle:'Prestation '+f.type,compte:compteProd,debit:0,credit:ht,auto:true});
      if(tvaMt>0) db.ecritures.push({id:uid('ec'),date:f.date,journal:'VE',piece,libelle:'TVA collectée',compte:'443000',debit:0,credit:tvaMt,auto:true});
      f.auto_ecrit = true;
      count+=2+(tvaMt>0?1:0);
    });

    // 2. Encaissements caisse
    db.caisse.forEach(c=>{
      if(c.auto_ecrit) return;
      const compteTreso = ({espece:'571000',mobile:'541000',virement:'512000',carte:'512000'})[c.mode] || '571000';
      if(c.type==='entree'){
        // Débit trésorerie / Crédit 411 clients (si encaissement facture) ou 758 produits divers
        const isFacture = c.description && (c.description.includes('Facture')||c.description.includes('Encaissement')||c.description.includes('RES-')||c.description.includes('Loyer'));
        const contrepartie = isFacture ? '411000' : '758000';
        db.ecritures.push({id:uid('ec'),date:c.date,journal:'CA',piece:c.ref,libelle:c.description,compte:compteTreso,debit:c.montant,credit:0,auto:true});
        db.ecritures.push({id:uid('ec'),date:c.date,journal:'CA',piece:c.ref,libelle:c.description,compte:contrepartie,debit:0,credit:c.montant,auto:true});
      } else {
        // Décaissement : Débit charge/401 fourn / Crédit trésorerie
        const isSalaire = c.description && (c.description.includes('Salaire')||c.description.includes('PAIE'));
        const isDepense = c.description && c.description.includes('Dépense');
        const contrepartie = isSalaire ? '421000' : (isDepense ? '605000' : '401000');
        db.ecritures.push({id:uid('ec'),date:c.date,journal:'CA',piece:c.ref,libelle:c.description,compte:contrepartie,debit:c.montant,credit:0,auto:true});
        db.ecritures.push({id:uid('ec'),date:c.date,journal:'CA',piece:c.ref,libelle:c.description,compte:compteTreso,debit:0,credit:c.montant,auto:true});
      }
      c.auto_ecrit = true;
      count+=2;
    });

    // 3. Paies (bulletins)
    db.paies.forEach(p=>{
      if(p.auto_ecrit) return;
      const emp = db.personnel.find(e=>e.id===p.personnelId);
      const lib = 'Salaire '+(emp?emp.prenom+' '+emp.nom:'—')+' '+p.periode;
      // Débit 661 Rémunération / Crédit 421 Personnel dû + 431 CNSS + 447 IRPP
      db.ecritures.push({id:uid('ec'),date:p.datePaiement,journal:'PA',piece:p.numero,libelle:lib,compte:'661000',debit:p.salaireBrut+(p.primes||0),credit:0,auto:true});
      db.ecritures.push({id:uid('ec'),date:p.datePaiement,journal:'PA',piece:p.numero,libelle:lib+' — Net',compte:'421000',debit:0,credit:p.salaireNet,auto:true});
      if(p.cnss>0) db.ecritures.push({id:uid('ec'),date:p.datePaiement,journal:'PA',piece:p.numero,libelle:lib+' — CNSS salariale',compte:'431000',debit:0,credit:p.cnss,auto:true});
      if(p.irpp>0) db.ecritures.push({id:uid('ec'),date:p.datePaiement,journal:'PA',piece:p.numero,libelle:lib+' — IRPP',compte:'447000',debit:0,credit:p.irpp,auto:true});
      // Employer contributions require an explicitly validated amount; no estimated journal entries.
      p.auto_ecrit = true;
      count+=6;
    });

    // 4. Dépenses
    (db.depenses||[]).forEach(d=>{
      if(d.auto_ecrit) return;
      const compteChg = ({achats:'601000',cuisine:'602000',entretien:'604000',salaires:'661000',loyer:'614000',electricite:'628000',autres:'605000'})[d.categorie] || '605000';
      db.ecritures.push({id:uid('ec'),date:d.date,journal:'AC',piece:d.ref||'DEP-'+d.id.slice(-6),libelle:d.description,compte:compteChg,debit:d.montant,credit:0,auto:true});
      db.ecritures.push({id:uid('ec'),date:d.date,journal:'AC',piece:d.ref||'DEP-'+d.id.slice(-6),libelle:d.description,compte:'401000',debit:0,credit:d.montant,auto:true});
      d.auto_ecrit = true;
      count+=2;
    });

    saveDB();
    renderEcritures();renderComptaDashboard();
    toast(count+' écritures générées');
  });
}

// ============ JOURNAUX ============
function renderJournal(){
  const code = document.getElementById('jnCode').value;
  const mois = document.getElementById('jnMois').value;
  const noms = {VE:'Journal des Ventes',AC:'Journal des Achats',CA:'Journal de Caisse',BQ:'Journal de Banque',PA:'Journal de Paie',OD:'Opérations Diverses'};
  document.getElementById('jnTitre').textContent = noms[code]+' — '+mois;
  const list = db.ecritures.filter(e=>e.journal===code && e.date.startsWith(mois))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  const totD = list.reduce((s,e)=>s+e.debit,0);
  const totC = list.reduce((s,e)=>s+e.credit,0);
  document.getElementById('journalTable').innerHTML = list.length ? list.map(e=>{
    const cpt = db.planComptable.find(c=>c.numero===e.compte);
    return `<tr>
      <td>${escapeHtml(fmtDate(e.date))}</td>
      <td>${escapeHtml(e.piece)}</td>
      <td><strong>${escapeHtml(e.compte)}</strong><br><small style="color:var(--muted)">${escapeHtml(cpt?cpt.libelle:'')}</small></td>
      <td>${escapeHtml(e.libelle)}</td>
      <td style="text-align:right">${escapeHtml(e.debit?fmt(e.debit):'')}</td>
      <td style="text-align:right">${escapeHtml(e.credit?fmt(e.credit):'')}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty">Aucune écriture pour cette période</td></tr>';
  document.getElementById('journalTotaux').innerHTML = `<tr style="background:var(--gold-soft);font-weight:700">
    <td colspan="4" style="text-align:right">TOTAL ${escapeHtml(code)} ${escapeHtml(mois)}</td>
    <td style="text-align:right">${escapeHtml(fmt(totD))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totC))}</td>
  </tr>`;
}

// ============ GRAND LIVRE ============
function renderGrandLivre(){
  const sel = document.getElementById('glCompte');
  if(sel && sel.options.length<=1){
    sel.innerHTML = db.planComptable.sort((a,b)=>a.numero.localeCompare(b.numero))
      .map(c=>`<option value="${escapeHtml(c.numero)}">${escapeHtml(c.numero)} — ${escapeHtml(c.libelle)}</option>`).join('');
  }
  const cpt = document.getElementById('glCompte').value;
  const du = document.getElementById('glDu')?.value||'';
  const au = document.getElementById('glAu')?.value||'';
  if(!cpt){ document.getElementById('grandLivreTable').innerHTML=''; return; }
  const compte = db.planComptable.find(c=>c.numero===cpt);
  document.getElementById('glTitre').textContent = 'Grand livre : '+cpt+' — '+(compte?compte.libelle:'');
  let list = db.ecritures.filter(e=>e.compte===cpt).sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(du) list = list.filter(e=>e.date>=du);
  if(au) list = list.filter(e=>e.date<=au);
  let solde = 0;
  document.getElementById('grandLivreTable').innerHTML = list.length ? list.map(e=>{
    solde += e.debit - e.credit;
    return `<tr>
      <td>${escapeHtml(fmtDate(e.date))}</td>
      <td>${escapeHtml(e.piece)}</td>
      <td><span class="badge badge-neutral">${escapeHtml(e.journal)}</span></td>
      <td>${escapeHtml(e.libelle)}</td>
      <td style="text-align:right">${escapeHtml(e.debit?fmt(e.debit):'')}</td>
      <td style="text-align:right">${escapeHtml(e.credit?fmt(e.credit):'')}</td>
      <td style="text-align:right;font-weight:700;color:${escapeHtml(solde>=0?'var(--success)':'var(--danger)')}">${escapeHtml(fmt(solde))}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" class="empty">Aucun mouvement</td></tr>';
  const totD = list.reduce((s,e)=>s+e.debit,0);
  const totC = list.reduce((s,e)=>s+e.credit,0);
  document.getElementById('grandLivreTotaux').innerHTML = `<tr style="background:var(--gold-soft);font-weight:700">
    <td colspan="4" style="text-align:right">TOTAUX</td>
    <td style="text-align:right">${escapeHtml(fmt(totD))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totC))}</td>
    <td style="text-align:right">Solde: ${escapeHtml(fmt(totD-totC))}</td>
  </tr>`;
}

// ============ BALANCE ============
function calcBalance(dateFin){
  const map = {};
  db.ecritures.filter(e=>!dateFin || e.date<=dateFin).forEach(e=>{
    if(!map[e.compte]) map[e.compte] = {debit:0, credit:0};
    map[e.compte].debit += e.debit;
    map[e.compte].credit += e.credit;
  });
  return map;
}
function renderBalance(){
  const dateFin = document.getElementById('balDate').value;
  const niveau = document.getElementById('balNiveau').value;
  const map = calcBalance(dateFin);
  let rows = [];
  if(niveau==='classe'){
    const parClasse = {};
    Object.entries(map).forEach(([n,v])=>{
      const cl = n[0];
      if(!parClasse[cl]) parClasse[cl] = {debit:0,credit:0};
      parClasse[cl].debit += v.debit;
      parClasse[cl].credit += v.credit;
    });
    rows = Object.entries(parClasse).sort().map(([cl,v])=>({numero:'Classe '+cl,libelle:classeLabel(cl),...v}));
  } else {
    rows = Object.entries(map).map(([n,v])=>{
      const c = db.planComptable.find(x=>x.numero===n);
      return {numero:n, libelle:c?c.libelle:'—', ...v};
    }).sort((a,b)=>a.numero.localeCompare(b.numero));
  }
  let totMD=0,totMC=0,totSD=0,totSC=0;
  document.getElementById('balanceTable').innerHTML = rows.length ? rows.map(r=>{
    const s = r.debit - r.credit;
    const sd = s>0?s:0, sc = s<0?-s:0;
    totMD+=r.debit;totMC+=r.credit;totSD+=sd;totSC+=sc;
    return `<tr>
      <td><strong>${escapeHtml(r.numero)}</strong></td>
      <td>${escapeHtml(r.libelle)}</td>
      <td style="text-align:right">${escapeHtml(fmt(r.debit))}</td>
      <td style="text-align:right">${escapeHtml(fmt(r.credit))}</td>
      <td style="text-align:right;color:var(--success);font-weight:600">${escapeHtml(sd?fmt(sd):'')}</td>
      <td style="text-align:right;color:var(--danger);font-weight:600">${escapeHtml(sc?fmt(sc):'')}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty">Aucune donnée</td></tr>';
  document.getElementById('balanceTotaux').innerHTML = `<tr style="background:var(--gold-soft);font-weight:700">
    <td colspan="2" style="text-align:right">TOTAUX</td>
    <td style="text-align:right">${escapeHtml(fmt(totMD))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totMC))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totSD))}</td>
    <td style="text-align:right">${escapeHtml(fmt(totSC))}</td>
  </tr>`;
}
function classeLabel(cl){
  return ({1:'Capitaux',2:'Immobilisations',3:'Stocks',4:'Tiers',5:'Trésorerie',6:'Charges',7:'Produits',8:'Autres charges/produits HAO'})[cl] || cl;
}

// ============ COMPTE DE RÉSULTAT ============
function renderResultat(){
  const du = document.getElementById('crDu').value;
  const au = document.getElementById('crAu').value;
  const list = db.ecritures.filter(e=>(!du||e.date>=du) && (!au||e.date<=au));

  // Produits par sous-catégorie
  const produits = {};
  list.filter(e=>e.compte.startsWith('7')).forEach(e=>{
    const cpt = db.planComptable.find(c=>c.numero===e.compte);
    const key = e.compte;
    if(!produits[key]) produits[key] = {libelle: cpt?cpt.libelle:'—', montant:0};
    produits[key].montant += (e.credit - e.debit);
  });
  const charges = {};
  list.filter(e=>e.compte.startsWith('6')).forEach(e=>{
    const cpt = db.planComptable.find(c=>c.numero===e.compte);
    const key = e.compte;
    if(!charges[key]) charges[key] = {libelle: cpt?cpt.libelle:'—', montant:0};
    charges[key].montant += (e.debit - e.credit);
  });
  const totProd = Object.values(produits).reduce((s,x)=>s+x.montant,0);
  const totChg = Object.values(charges).reduce((s,x)=>s+x.montant,0);
  const resultat = totProd - totChg;

  document.getElementById('resultatContent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Compte de résultat — Période ${escapeHtml(fmtDate(du||'—'))} au ${escapeHtml(fmtDate(au||'—'))}</h3></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <h4 style="color:var(--success);border-bottom:2px solid var(--success);padding-bottom:6px">PRODUITS (Classe 7)</h4>
          <table style="width:100%">
            ${Object.entries(produits).sort().map(([n,v])=>`<tr>
              <td>${escapeHtml(n)}</td><td>${escapeHtml(v.libelle)}</td>
              <td style="text-align:right;font-weight:600">${escapeHtml(fmt(v.montant))}</td>
            </tr>`).join('') || '<tr><td colspan="3" class="empty">—</td></tr>'}
            <tr style="background:var(--gold-soft);font-weight:800">
              <td colspan="2">TOTAL PRODUITS</td>
              <td style="text-align:right">${escapeHtml(fmt(totProd))}</td>
            </tr>
          </table>
        </div>
        <div>
          <h4 style="color:var(--danger);border-bottom:2px solid var(--danger);padding-bottom:6px">CHARGES (Classe 6)</h4>
          <table style="width:100%">
            ${Object.entries(charges).sort().map(([n,v])=>`<tr>
              <td>${escapeHtml(n)}</td><td>${escapeHtml(v.libelle)}</td>
              <td style="text-align:right;font-weight:600">${escapeHtml(fmt(v.montant))}</td>
            </tr>`).join('') || '<tr><td colspan="3" class="empty">—</td></tr>'}
            <tr style="background:var(--gold-soft);font-weight:800">
              <td colspan="2">TOTAL CHARGES</td>
              <td style="text-align:right">${escapeHtml(fmt(totChg))}</td>
            </tr>
          </table>
        </div>
      </div>
      <div style="margin-top:20px;padding:20px;background:${escapeHtml(resultat>=0?'#e8f5e9':'#ffebee')};border-radius:10px;text-align:center">
        <div style="font-size:14px;color:var(--muted);letter-spacing:1px">RÉSULTAT DE L'EXERCICE</div>
        <div style="font-size:32px;font-weight:900;color:${escapeHtml(resultat>=0?'var(--success)':'var(--danger)')}">${escapeHtml(resultat>=0?'BÉNÉFICE':'PERTE')} de ${escapeHtml(fmt(Math.abs(resultat)))}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:6px">Marge nette: ${escapeHtml(totProd>0?(resultat/totProd*100).toFixed(2):0)}%</div>
      </div>
    </div>`;
}

// ============ BILAN ============
function renderBilan(){
  const date = document.getElementById('blDate').value;
  const map = calcBalance(date);

  const cat = {actif_immo:0, actif_stocks:0, actif_creances:0, actif_treso:0,
               passif_capitaux:0, passif_dettes:0, passif_tresorerie:0};
  Object.entries(map).forEach(([n,v])=>{
    const solde = v.debit - v.credit;
    const c = n[0];
    if(c==='2') cat.actif_immo += solde;
    else if(c==='3') cat.actif_stocks += solde;
    else if(c==='4' && solde>0) cat.actif_creances += solde;
    else if(c==='4' && solde<0) cat.passif_dettes += -solde;
    else if(c==='5' && solde>0) cat.actif_treso += solde;
    else if(c==='5' && solde<0) cat.passif_tresorerie += -solde;
    else if(c==='1') cat.passif_capitaux += -solde;
  });
  // Ajouter le résultat
  const prods = db.ecritures.filter(e=>e.compte.startsWith('7') && (!date||e.date<=date)).reduce((s,e)=>s+(e.credit-e.debit),0);
  const chgs = db.ecritures.filter(e=>e.compte.startsWith('6') && (!date||e.date<=date)).reduce((s,e)=>s+(e.debit-e.credit),0);
  const resultat = prods - chgs;
  cat.passif_capitaux += resultat;

  const totalActif = cat.actif_immo + cat.actif_stocks + cat.actif_creances + cat.actif_treso;
  const totalPassif = cat.passif_capitaux + cat.passif_dettes + cat.passif_tresorerie;

  document.getElementById('bilanContent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Bilan au ${escapeHtml(fmtDate(date))}</h3></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <h4 style="background:var(--brown-dark);color:#fff;padding:8px;text-align:center">ACTIF</h4>
          <table style="width:100%">
            <tr><td>Immobilisations (Classe 2)</td><td style="text-align:right">${escapeHtml(fmt(cat.actif_immo))}</td></tr>
            <tr><td>Stocks (Classe 3)</td><td style="text-align:right">${escapeHtml(fmt(cat.actif_stocks))}</td></tr>
            <tr><td>Créances clients (Classe 4)</td><td style="text-align:right">${escapeHtml(fmt(cat.actif_creances))}</td></tr>
            <tr><td>Trésorerie (Classe 5)</td><td style="text-align:right">${escapeHtml(fmt(cat.actif_treso))}</td></tr>
            <tr style="background:var(--gold-soft);font-weight:800"><td>TOTAL ACTIF</td><td style="text-align:right">${escapeHtml(fmt(totalActif))}</td></tr>
          </table>
        </div>
        <div>
          <h4 style="background:var(--brown-dark);color:#fff;padding:8px;text-align:center">PASSIF</h4>
          <table style="width:100%">
            <tr><td>Capitaux propres + Résultat (Classe 1)</td><td style="text-align:right">${escapeHtml(fmt(cat.passif_capitaux))}</td></tr>
            <tr><td>Dettes fournisseurs / fiscales / sociales (Classe 4)</td><td style="text-align:right">${escapeHtml(fmt(cat.passif_dettes))}</td></tr>
            <tr><td>Découverts bancaires (Classe 5)</td><td style="text-align:right">${escapeHtml(fmt(cat.passif_tresorerie))}</td></tr>
            <tr style="background:var(--gold-soft);font-weight:800"><td>TOTAL PASSIF</td><td style="text-align:right">${escapeHtml(fmt(totalPassif))}</td></tr>
          </table>
        </div>
      </div>
      <div style="margin-top:16px;padding:12px;background:${escapeHtml(Math.abs(totalActif-totalPassif)<1?'#e8f5e9':'#fff3cd')};border-radius:8px;text-align:center">
        ${escapeHtml(Math.abs(totalActif-totalPassif)<1 ? '✓ Bilan équilibré' : '⚠ Écart Actif − Passif = '+fmt(totalActif-totalPassif)+' (à investiguer)')}
      </div>
    </div>`;
}

// ============ TVA ============
function renderTVA(){
  const mois = document.getElementById('tvaMois').value;
  const collectee = db.ecritures.filter(e=>e.compte==='443000' && e.date.startsWith(mois)).reduce((s,e)=>s+(e.credit-e.debit),0);
  const deductible = db.ecritures.filter(e=>e.compte==='445000' && e.date.startsWith(mois)).reduce((s,e)=>s+(e.debit-e.credit),0);
  const aPayer = collectee - deductible;
  const caTTC = db.ecritures.filter(e=>e.compte.startsWith('7') && e.date.startsWith(mois)).reduce((s,e)=>s+(e.credit-e.debit),0) + collectee;

  document.getElementById('tvaContent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3>Déclaration TVA — ${escapeHtml(mois)}</h3></div>
      <table style="width:100%;margin-top:12px">
        <tr style="background:var(--brown-dark);color:#fff"><th style="text-align:left;padding:10px">Rubrique</th><th style="text-align:right;padding:10px">Montant</th></tr>
        <tr><td style="padding:10px">Chiffre d'affaires TTC</td><td style="text-align:right;padding:10px">${escapeHtml(fmt(caTTC))}</td></tr>
        <tr><td style="padding:10px">Base HT imposable</td><td style="text-align:right;padding:10px">${escapeHtml(fmt(caTTC-collectee))}</td></tr>
        <tr><td style="padding:10px">Taux TVA</td><td style="text-align:right;padding:10px">${escapeHtml(db.config.tva)}%</td></tr>
        <tr style="background:#fff9e6"><td style="padding:10px;font-weight:600">TVA collectée (443)</td><td style="text-align:right;padding:10px;font-weight:600">${escapeHtml(fmt(collectee))}</td></tr>
        <tr style="background:#e6f5ff"><td style="padding:10px;font-weight:600">TVA déductible (445)</td><td style="text-align:right;padding:10px;font-weight:600">${escapeHtml(fmt(deductible))}</td></tr>
        <tr style="background:${escapeHtml(aPayer>=0?'#ffebee':'#e8f5e9')};font-weight:800;font-size:16px">
          <td style="padding:14px">${escapeHtml(aPayer>=0?'TVA À PAYER':'CRÉDIT DE TVA (à reporter)')}</td>
          <td style="text-align:right;padding:14px">${escapeHtml(fmt(Math.abs(aPayer)))}</td>
        </tr>
      </table>
      <div style="margin-top:14px;padding:12px;background:#fdf8ef;border-radius:8px;font-size:12px;color:var(--muted)">
        📋 <strong>Rappel</strong> : la déclaration doit être déposée au plus tard le 20 du mois suivant auprès de la Direction Générale des Impôts (DGI).
      </div>
    </div>`;
}

// ============ CLÔTURE ============
function renderClotures(){
  const list = (db.exercices||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));
  document.getElementById('cloturesTable').innerHTML = list.length ? list.map(c=>`
    <tr>
      <td>${escapeHtml(fmtDate(c.date))}</td>
      <td>${escapeHtml(c.type)}</td>
      <td>${escapeHtml(c.periode)}</td>
      <td style="font-weight:700;color:${escapeHtml(c.resultat>=0?'var(--success)':'var(--danger)')}">${escapeHtml(fmt(c.resultat))}</td>
      <td>${escapeHtml(c.nbEcritures)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="annulerCloture('${escapeInline(c.id)}')">↺ Rouvrir</button></td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="empty">Aucune clôture</td></tr>';
}
function cloturer(){
  const type = document.getElementById('clType').value;
  const periode = document.getElementById('clPeriode').value;
  if(!periode){toast('Sélectionnez une période','warning');return}
  confirmDialog(`Confirmer la clôture ${type} pour ${periode} ? Cette action verrouille les écritures.`,()=>{
    const filter = type==='annuelle' ? (d=>d.startsWith(periode.slice(0,4))) : (d=>d.startsWith(periode));
    const ecs = db.ecritures.filter(e=>filter(e.date));
    ecs.forEach(e=>e.verrouille=true);
    const prods = ecs.filter(e=>e.compte.startsWith('7')).reduce((s,e)=>s+(e.credit-e.debit),0);
    const chgs = ecs.filter(e=>e.compte.startsWith('6')).reduce((s,e)=>s+(e.debit-e.credit),0);
    const resultat = prods - chgs;
    // Écriture de clôture : virement 6 et 7 vers 120
    const dt = periode + (type==='annuelle'?'-12-31':'-'+new Date(periode+'-01').toISOString().slice(5,10));
    const piece = 'CLOT-'+periode.replace('-','');
    // Solder les 7 (débiter) et 6 (créditer) contre 120
    const parCpt7 = {};
    ecs.filter(e=>e.compte.startsWith('7')).forEach(e=>{
      if(!parCpt7[e.compte]) parCpt7[e.compte]=0;
      parCpt7[e.compte] += e.credit - e.debit;
    });
    const parCpt6 = {};
    ecs.filter(e=>e.compte.startsWith('6')).forEach(e=>{
      if(!parCpt6[e.compte]) parCpt6[e.compte]=0;
      parCpt6[e.compte] += e.debit - e.credit;
    });
    Object.entries(parCpt7).forEach(([c,m])=>{
      if(m>0) db.ecritures.push({id:uid('ec'),date:dt,journal:'OD',piece,libelle:'Clôture — solde produit',compte:c,debit:m,credit:0,auto:true,verrouille:true});
    });
    Object.entries(parCpt6).forEach(([c,m])=>{
      if(m>0) db.ecritures.push({id:uid('ec'),date:dt,journal:'OD',piece,libelle:'Clôture — solde charge',compte:c,debit:0,credit:m,auto:true,verrouille:true});
    });
    if(resultat!==0){
      db.ecritures.push({id:uid('ec'),date:dt,journal:'OD',piece,libelle:'Résultat de l\'exercice',compte:'120000',debit:resultat<0?-resultat:0,credit:resultat>0?resultat:0,auto:true,verrouille:true});
    }
    db.exercices.push({
      id:uid('ex'),
      date: new Date().toISOString().slice(0,10),
      type, periode,
      resultat, nbEcritures: ecs.length
    });
    saveDB();renderClotures();renderComptaDashboard();
    toast('Clôture effectuée — Résultat: '+fmt(resultat));
  });
}
function annulerCloture(id){
  confirmDialog('Rouvrir cette clôture ? Les écritures seront à nouveau modifiables.',()=>{
    const c = db.exercices.find(x=>x.id===id);
    if(!c) return;
    const filter = c.type==='annuelle' ? (d=>d.startsWith(c.periode.slice(0,4))) : (d=>d.startsWith(c.periode));
    db.ecritures.forEach(e=>{ if(filter(e.date)) e.verrouille=false; });
    // supprimer écritures de clôture
    db.ecritures = db.ecritures.filter(e=>!(e.piece==='CLOT-'+c.periode.replace('-','')));
    db.exercices = db.exercices.filter(x=>x.id!==id);
    saveDB();renderClotures();toast('Clôture annulée','warning');
  });
}

// ============ EXPORTS & IMPRESSIONS ============
function exportEcritures(){
  let csv = 'Date;Journal;Piece;Compte;Libelle;Debit;Credit\n';
  db.ecritures.forEach(e=>{
    csv += `${e.date};${e.journal};${e.piece};${e.compte};"${e.libelle.replace(/"/g,'""')}";${e.debit};${e.credit}\n`;
  });
  downloadFile('ecritures.csv', csv);
}
function exportBalance(){
  const dateFin = document.getElementById('balDate').value;
  const map = calcBalance(dateFin);
  let csv = 'Compte;Libelle;Debit;Credit;Solde debiteur;Solde crediteur\n';
  Object.entries(map).sort().forEach(([n,v])=>{
    const c = db.planComptable.find(x=>x.numero===n);
    const s = v.debit - v.credit;
    csv += `${n};"${c?c.libelle:''}";${v.debit};${v.credit};${s>0?s:0};${s<0?-s:0}\n`;
  });
  downloadFile('balance.csv', csv);
}
function imprimerJournal(){window.print()}
function imprimerGrandLivre(){window.print()}
function imprimerBalance(){window.print()}
function imprimerResultat(){window.print()}
function imprimerBilan(){window.print()}
function imprimerTVA(){window.print()}





// ============================================================
// ============ RESTAURANT — MODULE ENRICHI ============
// ============================================================

const CATEGORIES_DEFAUT = ['Entrée','Plat','Dessert','Boisson chaude','Boisson fraîche','Bière','Vin','Cocktail','Cafétéria','Autre'];

function switchRestoTab(t){
  document.querySelectorAll('[data-restotab]').forEach(el=>el.classList.toggle('active',el.dataset.restotab===t));
  ['commandes','salle','cuisine','resa','menu','formules','stats','rapports'].forEach(k=>{
    const el = document.getElementById('resto-'+k);
    if(el) el.style.display = k===t?'block':'none';
  });
  const map = {commandes:renderCommandes,salle:renderPlanSalle,cuisine:renderCuisine,
               resa:renderReservationsResto,menu:renderMenu,formules:renderFormules,
               stats:renderStatsResto,rapports:renderRapportsResto};
  if(map[t]) map[t]();
}

function initRestoPage(){
  // Tables are configured by the hotel; opening a page must not create fictitious tables.
  if(!db.tablesResto)db.tablesResto=[];
  if(!db.categoriesMenu || !db.categoriesMenu.length){
    db.categoriesMenu = CATEGORIES_DEFAUT.map(n=>({id:uid('ct'),nom:n,envoi:['Boisson chaude','Boisson fraîche','Bière','Vin','Cocktail'].includes(n)?'bar':'cuisine'}));
    saveDB();
  }
  // Init dates stats
  const today = new Date().toISOString().slice(0,10);
  ['statDu','statAu','resaDate'].forEach(id=>{
    const e = document.getElementById(id);
    if(e && !e.value) e.value = today;
  });
  renderCommandes();

  // Auto-refresh KDS
  if(window._kdsInterval) clearInterval(window._kdsInterval);
  window._kdsInterval = setInterval(()=>{
    const c = document.querySelector('[data-restotab="cuisine"]');
    if(c && c.classList.contains('active')) renderCuisine();
  }, 20000);
}

// ============ COMMANDES (enrichi) ============
function renderCommandes(){
  const q = (document.getElementById('cmdSearch')?.value||'').toLowerCase();
  const st = document.getElementById('cmdStatus')?.value||'';
  const tp = document.getElementById('cmdType')?.value||'';
  const sv = document.getElementById('cmdServeurF')?.value||'';

  // Peupler filtre serveurs
  const sel = document.getElementById('cmdServeurF');
  if(sel && sel.options.length<=1){
    const serveurs = [...new Set(db.commandes.map(c=>c.serveur).filter(Boolean))];
    serveurs.forEach(s=>{
      const opt = document.createElement('option'); opt.value=s; opt.textContent=s; sel.appendChild(opt);
    });
  }

  let list = [...db.commandes].sort((a,b)=>new Date(b.date)-new Date(a.date));
  list = list.filter(c=>{
    if(st && c.statut!==st) return false;
    if(tp && c.typeService!==tp) return false;
    if(sv && c.serveur!==sv) return false;
    if(q){
      const s = (c.numero+' '+(c.clientNom||'')+' '+(c.table||'')).toLowerCase();
      if(!s.includes(q)) return false;
    }
    return true;
  });

  // KPIs
  const today = new Date().toISOString().slice(0,10);
  const cmdJour = db.commandes.filter(c=>c.date && c.date.startsWith(today));
  document.getElementById('rstCmdJour').textContent = cmdJour.length;
  document.getElementById('rstCAJour').textContent = fmt(cmdJour.reduce((s,c)=>s+(c.total||0),0));
  document.getElementById('rstTblOcc').textContent = (db.tablesResto||[]).filter(t=>t.statut==='occupee').length;
  document.getElementById('rstEnAttente').textContent = db.commandes.filter(c=>c.statut==='commandee'||c.statut==='cuisine').length;

  document.getElementById('commandesTable').innerHTML = list.length ? list.map(c=>{
    const typeIcon = ({sur_place:'🍽',a_emporter:'🥡',livraison:'🛵',room_service:'🛎'})[c.typeService]||'🍽';
    return `<tr>
      <td><strong>${escapeHtml(c.numero)}</strong></td>
      <td style="font-size:12px">${escapeHtml(fmtDateTime(c.date))}</td>
      <td>${escapeHtml(typeIcon)} ${escapeHtml(c.table||c.typeService||'—')}</td>
      <td>${escapeHtml(c.clientNom||'—')}</td>
      <td style="font-size:12px">${escapeHtml(c.serveur||'—')}</td>
      <td>${escapeHtml((c.lignes||[]).length)} art.</td>
      <td style="font-weight:700">${escapeHtml(fmt(c.total))}</td>
      <td>${statutCmdBadge(c.statut)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm btn-ghost" onclick="viewCommande('${escapeInline(c.id)}')" title="Voir">👁</button>
        ${c.statut!=='paye' && c.statut!=='annulee' ? `<button class="btn btn-sm btn-gold" onclick="changerStatutCmd('${escapeInline(c.id)}')" title="Changer statut">🔄</button>`:''}
        ${c.statut!=='paye' && c.statut!=='annulee' ? `<button class="btn btn-sm btn-primary" onclick="editCommande('${escapeInline(c.id)}')" title="Modifier">✎</button>`:''}
        ${c.statut!=='paye' && c.statut!=='annulee' ? `<button class="btn btn-sm btn-green" onclick="payerCmd('${escapeInline(c.id)}')" title="Encaisser">💰</button>`:''}
        <button class="btn btn-sm btn-gold" onclick="imprimerTicketCuisine('${escapeInline(c.id)}')" title="Ticket cuisine">👨‍🍳</button>
        <button class="btn btn-sm btn-gold" onclick="imprimerFactureResto('${escapeInline(c.id)}')" title="Addition">🖨</button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="9" class="empty">Aucune commande</td></tr>';
}

function statutCmdBadge(s){
  const map = {
    commandee:{lib:'📝 Commandée',bg:'#e3f2fd',color:'#1976d2'},
    cuisine:{lib:'👨‍🍳 En cuisine',bg:'#fff3e0',color:'#ef6c00'},
    prete:{lib:'🔔 Prête',bg:'#f3e5f5',color:'#8e24aa'},
    servie:{lib:'🍽 Servie',bg:'#e0f7fa',color:'#00838f'},
    paye:{lib:'💰 Payée',bg:'#e8f5e9',color:'#2e7d32'},
    annulee:{lib:'✖ Annulée',bg:'#ffebee',color:'#c62828'}
  };
  const c = map[s] || {lib:s,bg:'#f5f5f5',color:'#666'};
  return `<span style="padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;color:${escapeHtml(c.color)};background:${escapeHtml(c.bg)}">${escapeHtml(c.lib)}</span>`;
}

// ============ Modal nouvelle commande enrichie ============
let cmdLignes = [];
function openCommandeModal(id){
  const c = id ? db.commandes.find(x=>x.id===id) : null;
  cmdLignes = c ? JSON.parse(JSON.stringify(c.lignes||[])) : [];
  const menuDispo = db.menu.filter(m=>m.disponible);
  const tables = (db.tablesResto||[]).filter(t=>t.statut!=='hors_service');
  const chOccupees = db.chambres.filter(ch=>ch.statut==='occupee');
  const serveurs = db.personnel.filter(p=>p.actif && (p.service==='Restauration' || p.poste.toLowerCase().includes('serveur') || p.poste.toLowerCase().includes('bar')));

  openModal(id?'Modifier commande '+c.numero:'🍽 Nouvelle commande', `
    <form id="cmdForm" onsubmit="saveCommande(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Type de service *</label>
          <select class="form-control" id="cmdType2" required onchange="onChangeTypeService()">
            <option value="sur_place" ${escapeHtml(c&&c.typeService==='sur_place'?'selected':'')}>🍽 Sur place</option>
            <option value="a_emporter" ${escapeHtml(c&&c.typeService==='a_emporter'?'selected':'')}>🥡 À emporter</option>
            <option value="livraison" ${escapeHtml(c&&c.typeService==='livraison'?'selected':'')}>🛵 Livraison</option>
            <option value="room_service" ${escapeHtml(c&&c.typeService==='room_service'?'selected':'')}>🛎 Room service (client hôtel)</option>
          </select>
        </div>
        <div class="form-group" id="grpTable"><label>Table</label>
          <select class="form-control" id="cmdTable">
            <option value="">— Sélectionner —</option>
            ${tables.map(t=>`<option value="${escapeHtml(t.numero)}" ${escapeHtml(c&&c.table===t.numero?'selected':'')}>${escapeHtml(t.numero)} — ${escapeHtml(t.zone)} (${escapeHtml(t.capacite)}p)</option>`).join('')}
          </select>
        </div>
        <div class="form-group" id="grpChambre" style="display:none"><label>Chambre (client hôtel)</label>
          <select class="form-control" id="cmdChambre">
            <option value="">— Sélectionner —</option>
            ${chOccupees.map(ch=>{
              const resa = db.reservations.find(r=>r.chambreId===ch.id && r.statut==='checkin');
              const cl = resa ? db.clients.find(cl=>cl.id===resa.clientId) : null;
              return `<option value="${escapeHtml(ch.id)}" ${escapeHtml(c&&c.chambreId===ch.id?'selected':'')}>Ch. ${escapeHtml(ch.numero)} — ${escapeHtml(cl?cl.prenom+' '+cl.nom:'—')}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="form-group"><label>Nom client / N° table</label>
          <input class="form-control" id="cmdClient" value="${escapeHtml(c?c.clientNom||'':'')}" placeholder="Ex: M. Ouedraogo">
        </div>
        <div class="form-group"><label>Nb couverts</label>
          <input type="number" class="form-control" id="cmdCouverts" min="1" value="${escapeHtml(c?c.couverts||2:2)}">
        </div>
        <div class="form-group"><label>Serveur *</label>
          <select class="form-control" id="cmdServeur" required>
            ${serveurs.length ? serveurs.map(s=>`<option value="${escapeHtml(s.prenom+' '+s.nom)}" ${escapeHtml(c&&c.serveur===s.prenom+' '+s.nom?'selected':'')}>${escapeHtml(s.prenom)} ${escapeHtml(s.nom)}</option>`).join('') : `<option value="${escapeHtml(db.currentUser?db.currentUser.nom:'')}">${escapeHtml(db.currentUser?db.currentUser.nom:'')}</option>`}
          </select>
        </div>
        <div class="form-group" id="grpAdresse" style="display:none;grid-column:span 2"><label>Adresse de livraison</label>
          <input class="form-control" id="cmdAdresse" value="${escapeHtml(c?c.adresse||'':'')}">
        </div>
        <div class="form-group" id="grpTel" style="display:none"><label>Téléphone livraison</label>
          <input class="form-control" id="cmdTel" value="${escapeHtml(c?c.tel||'':'')}">
        </div>
      </div>

      <h4 style="margin:16px 0 8px;color:var(--brown-dark)">🥘 Articles</h4>
      <div style="display:flex;gap:8px;align-items:end">
        <div class="form-group" style="flex:2"><label>Article</label>
          <select class="form-control" id="cmdItem" onchange="prefillPu()">
            <option value="">— Choisir —</option>
            ${menuDispo.sort((a,b)=>a.categorie.localeCompare(b.categorie)).map(m=>`<option value="${escapeHtml(m.id)}" data-prix="${escapeHtml(m.prix)}" data-nom="${escapeHtml(m.nom)}" data-envoi="${escapeHtml(m.envoi||'cuisine')}" data-cat="${escapeHtml(m.categorie)}">${escapeHtml(m.nom)} — ${escapeHtml(fmt(m.prix))} (${escapeHtml(m.categorie)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Qté</label>
          <input type="number" class="form-control" id="cmdQte" value="1" min="1" style="width:70px">
        </div>
        <div class="form-group"><label>Note</label>
          <input class="form-control" id="cmdNote" placeholder="Ex: sans piment" style="width:150px">
        </div>
        <button type="button" class="btn btn-gold" onclick="addLigneCmd()">+ Ajouter</button>
      </div>

      <div class="table-wrap" style="margin-top:12px">
        <table>
          <thead><tr><th>Article</th><th>Qté</th><th>PU</th><th>Note</th><th>Envoi</th><th>Total</th><th></th></tr></thead>
          <tbody id="cmdLignesBody"></tbody>
        </table>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div style="background:var(--gold-soft);padding:12px;border-radius:8px">
          <div class="form-group"><label>Remise (%)</label>
            <input type="number" class="form-control" id="cmdRemise" min="0" max="100" value="${escapeHtml(c?c.remisePct||0:0)}" oninput="refreshCmdLignes()">
          </div>
          <div class="form-group"><label>Pourboire (FCFA)</label>
            <input type="number" class="form-control" id="cmdPourboire" min="0" value="${escapeHtml(c?c.pourboire||0:0)}" oninput="refreshCmdLignes()">
          </div>
        </div>
        <div style="background:var(--brown-dark);color:#fff;padding:14px;border-radius:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Sous-total HT</span><strong id="cmdSsHT">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Remise</span><strong id="cmdRem" style="color:#ffcccc">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>TVA (${escapeHtml(f.totalHT?Math.round(Number(f.tva)/Number(f.totalHT)*100):0)}%)</span><strong id="cmdTVA">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Pourboire</span><strong id="cmdPour">0</strong></div>
          <hr style="border-color:#8B5A2B;margin:8px 0">
          <div style="display:flex;justify-content:space-between;font-size:20px"><span>TOTAL</span><strong id="cmdTotal" style="color:var(--gold)">0 FCFA</strong></div>
        </div>
      </div>

      <div class="form-group" style="margin-top:12px"><label>Notes générales</label>
        <textarea class="form-control" id="cmdNotesGen" rows="2">${escapeHtml(c?c.notesGen||'':'')}</textarea>
      </div>
    </form>
  `, `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="document.getElementById('cmdForm').requestSubmit()">💾 ${escapeHtml(id?'Mettre à jour':'Enregistrer')}</button>`);
  setTimeout(()=>{ onChangeTypeService(); refreshCmdLignes(); },50);
}

function onChangeTypeService(){
  const t = document.getElementById('cmdType2').value;
  document.getElementById('grpTable').style.display = t==='sur_place'?'block':'none';
  document.getElementById('grpChambre').style.display = t==='room_service'?'block':'none';
  document.getElementById('grpAdresse').style.display = t==='livraison'?'block':'none';
  document.getElementById('grpTel').style.display = t==='livraison'?'block':'none';
}

function prefillPu(){
  // rien pour l'instant, hook réservé
}

function addLigneCmd(){
  const sel = document.getElementById('cmdItem');
  const qte = parseInt(document.getElementById('cmdQte').value)||1;
  const note = document.getElementById('cmdNote').value;
  if(!sel.value){toast('Choisissez un article','warning');return}
  const opt = sel.options[sel.selectedIndex];
  cmdLignes.push({
    menuId:sel.value,
    nom:opt.dataset.nom,
    qte,
    pu:parseFloat(opt.dataset.prix),
    note,
    envoi:opt.dataset.envoi||'cuisine',
    categorie:opt.dataset.cat||''
  });
  refreshCmdLignes();
  sel.value=''; document.getElementById('cmdQte').value=1; document.getElementById('cmdNote').value='';
}

function refreshCmdLignes(){
  const ssTot = cmdLignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const rem = parseFloat(document.getElementById('cmdRemise')?.value)||0;
  const pour = parseFloat(document.getElementById('cmdPourboire')?.value)||0;
  const remMt = Math.round(ssTot*rem/100);
  const netHT = Math.round((ssTot-remMt)/(1+db.config.tva/100));
  const tvaMt = ssTot - remMt - netHT;
  const total = ssTot - remMt + pour;
  document.getElementById('cmdLignesBody').innerHTML = cmdLignes.length ? cmdLignes.map((l,i)=>`
    <tr>
      <td><strong>${escapeHtml(l.nom)}</strong></td>
      <td>${escapeHtml(l.qte)}</td>
      <td>${escapeHtml(fmt(l.pu))}</td>
      <td style="font-size:11px;color:var(--muted);font-style:italic">${escapeHtml(l.note||'')}</td>
      <td>${escapeHtml(l.envoi==='bar'?'🍹':'👨‍🍳')}</td>
      <td style="font-weight:700">${escapeHtml(fmt(l.qte*l.pu))}</td>
      <td>
        <button type="button" class="btn btn-sm btn-ghost" onclick="cmdLignes[${escapeInline(i)}].qte++;refreshCmdLignes()">+</button>
        <button type="button" class="btn btn-sm btn-ghost" onclick="if(cmdLignes[${escapeInline(i)}].qte>1)cmdLignes[${escapeInline(i)}].qte--;refreshCmdLignes()">−</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="cmdLignes.splice(${escapeInline(i)},1);refreshCmdLignes()">×</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="7" class="empty">Aucun article</td></tr>';
  const el = (id, v) => { const e=document.getElementById(id); if(e) e.textContent = fmt(v); };
  el('cmdSsHT', ssTot);
  el('cmdRem', remMt);
  el('cmdTVA', tvaMt);
  el('cmdPour', pour);
  el('cmdTotal', total);
}

function saveCommande(e, id){
  e.preventDefault();
  if(!cmdLignes.length){toast('Ajoutez au moins un article','warning');return}
  const ssTot = cmdLignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const rem = parseFloat(document.getElementById('cmdRemise').value)||0;
  const pour = parseFloat(document.getElementById('cmdPourboire').value)||0;
  const remMt = Math.round(ssTot*rem/100);
  const total = ssTot - remMt + pour;
  const table = document.getElementById('cmdTable').value;
  const type = document.getElementById('cmdType2').value;
  const data = {
    typeService: type,
    table: table,
    chambreId: document.getElementById('cmdChambre').value,
    clientNom: document.getElementById('cmdClient').value,
    couverts: parseInt(document.getElementById('cmdCouverts').value)||1,
    serveur: document.getElementById('cmdServeur').value,
    adresse: document.getElementById('cmdAdresse').value,
    tel: document.getElementById('cmdTel').value,
    lignes: cmdLignes,
    ssTotal: ssTot,
    remisePct: rem,
    remise: remMt,
    pourboire: pour,
    total,
    notesGen: document.getElementById('cmdNotesGen').value
  };
  if(id){
    Object.assign(db.commandes.find(x=>x.id===id), data);
  } else {
    data.id = uid('cm');
    data.numero = 'CMD-'+(5000+db.commandes.length);
    data.date = new Date().toISOString();
    data.statut = 'commandee';
    data.paye = 0;
    db.commandes.push(data);
    // Marquer la table comme occupée
    if(type==='sur_place' && table){
      const t = db.tablesResto.find(x=>x.numero===table);
      if(t){ t.statut='occupee'; t.commandeId=data.id; }
    }
  }
  saveDB(); closeModal(); renderCommandes();
  toast(id?'Commande mise à jour':'Commande enregistrée — Ticket cuisine à envoyer');
  if(!id) setTimeout(()=>{ if(confirm('Imprimer le ticket cuisine maintenant ?')) imprimerTicketCuisine(data.id); }, 300);
}

function editCommande(id){ openCommandeModal(id); }

function changerStatutCmd(id){
  const c = db.commandes.find(x=>x.id===id);
  const flux = ['commandee','cuisine','prete','servie'];
  openModal('Statut de la commande '+c.numero, `
    <p>Statut actuel : ${statutCmdBadge(c.statut)}</p>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${flux.map(s=>s===c.statut?'':`<button class="btn btn-primary" onclick="setStatutCmd('${escapeInline(id)}','${escapeInline(s)}')">${statutCmdBadge(s)}</button>`).join('')}
      <hr>
      <button class="btn btn-danger" onclick="setStatutCmd('${escapeInline(id)}','annulee')">${statutCmdBadge('annulee')}</button>
    </div>
  `,'<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>');
}

function setStatutCmd(id, statut){
  const c = db.commandes.find(x=>x.id===id);
  if(!c||c.paye>0||!['commandee','cuisine','prete','servie','annulee'].includes(statut)){toast('Utilisez l’encaissement pour clôturer une commande','warning');return;}
  c.statut = statut;
  if(statut==='annulee'){
    // Libérer table
    const t = db.tablesResto.find(x=>x.numero===c.table);
    if(t){ t.statut='libre'; delete t.commandeId; }
  }
  saveDB(); closeModal(); renderCommandes();
  toast('Statut mis à jour : '+statut);
}

function payerCmd(id){
  if(!sessionActive()){toast('Ouvrez la caisse avant d’encaisser','warning');return;}
  const c = db.commandes.find(x=>x.id===id);
  openModal('💰 Encaissement — '+c.numero, `
    <form id="payForm" onsubmit="finaliserPaiement(event,'${escapeInline(id)}')">
      <div style="background:var(--brown-dark);color:#fff;padding:14px;border-radius:8px;margin-bottom:14px;text-align:center">
        <div style="font-size:11px;letter-spacing:1px">MONTANT À ENCAISSER</div>
        <div style="font-size:32px;font-weight:900;color:var(--gold)">${escapeHtml(fmt(c.total-c.paye))}</div>
      </div>
      <h4>Répartition des paiements</h4>
      <div id="paiementsLignes"></div>
      <button type="button" class="btn btn-sm btn-gold" onclick="ajouterPaiementLigne()">+ Mode de paiement</button>
      <div style="margin-top:12px;padding:10px;background:var(--gold-soft);border-radius:6px">
        <div>Total encaissé : <strong id="payTotal">0 FCFA</strong></div>
        <div id="payReste" style="font-weight:700;font-size:16px"></div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-green" onclick="document.getElementById('payForm').requestSubmit()">✅ Valider paiement</button>`);
  window._paiements = [];
  ajouterPaiementLigne(c.total-c.paye, 'espece');
}

function ajouterPaiementLigne(mt, mode){
  const idx = window._paiements.length;
  window._paiements.push({mode:mode||'espece', montant:mt||0});
  const html = `<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-bottom:6px">
    <select class="form-control" onchange="window._paiements[${escapeInline(idx)}].mode=this.value">
      <option value="espece" ${escapeHtml((mode||'espece')==='espece'?'selected':'')}>💵 Espèces</option>
      <option value="mobile" ${escapeHtml(mode==='mobile'?'selected':'')}>📱 Mobile Money</option>
      <option value="virement" ${escapeHtml(mode==='virement'?'selected':'')}>🏦 Virement</option>
      <option value="carte" ${escapeHtml(mode==='carte'?'selected':'')}>💳 Carte</option>
    </select>
    <input type="number" class="form-control" value="${escapeHtml(mt||0)}" oninput="window._paiements[${escapeInline(idx)}].montant=parseFloat(this.value)||0;majTotalPay()">
    <button type="button" class="btn btn-sm btn-danger" onclick="window._paiements[${escapeInline(idx)}].montant=0;this.parentElement.remove();majTotalPay()">×</button>
  </div>`;
  document.getElementById('paiementsLignes').insertAdjacentHTML('beforeend', html);
  majTotalPay();
}

function majTotalPay(){
  const total = window._paiements.reduce((s,p)=>s+p.montant, 0);
  const c = db.commandes.find(x=>x.id===_currentPayCmdId);
  document.getElementById('payTotal').textContent = fmt(total);
  const el = document.getElementById('payReste');
  if(!el || !c) return;
  const diff = total - (c.total-c.paye);
  if(diff===0){ el.textContent='✓ Exactement le montant dû'; el.style.color='var(--success)'; }
  else if(diff>0){ el.textContent='Réduisez la répartition de '+fmt(diff); el.style.color='var(--gold-dark)'; }
  else { el.textContent='Manque : '+fmt(-diff); el.style.color='var(--danger)'; }
}
let _currentPayCmdId = null;
function _wrapPayerCmd(){
  const _origPayerCmd = payerCmd;
  window.payerCmd = function(id){ _currentPayCmdId = id; _origPayerCmd(id); };
}
_wrapPayerCmd();

async function finaliserPaiement(e,id){
 e.preventDefault();const c=db.commandes.find(x=>x.id===id);if(!c||c.statut==='paye'||c.statut==='annulee')return;
 const payments=window._paiements.filter(p=>p.montant!==0).map(p=>({mode:p.mode,montant:Number(p.montant)}));
 if(!payments.length||payments.length>8||payments.some(p=>!Number.isFinite(p.montant)||p.montant<=0||!['espece','mobile','carte','virement'].includes(p.mode))||Math.abs(payments.reduce((sum,p)=>sum+p.montant,0)-(c.total-c.paye))>0.001){toast('La répartition doit correspondre exactement au solde dû','warning');return;}
 if(!cloudReady||!sessionActive()||recoveryBlocked){toast('Une connexion serveur et une caisse ouverte sont nécessaires','warning');return;}
 await queueCloudSync();if(window.hotelSyncPending)return;
 const key='soonre-restaurant-payment:'+db.hotelId+':'+id;let operation;
 try{const old=JSON.parse(localStorage.getItem(key)||'null');operation=JSON.stringify(old?.payments)===JSON.stringify(payments)?old.operation:crypto.randomUUID();localStorage.setItem(key,JSON.stringify({operation,payments}));}catch{operation=crypto.randomUUID();}
 const {error}=await callServerRPC('encaisser_commande',{p_id:id,p_paiements:payments,p_operation:operation});
 if(error){toast('Paiement non confirmé : '+error.message+'. Réessayez avec la même répartition.','danger');return;}
 localStorage.removeItem(key);closeModal();
 try{await loadCloudState();renderCommandes();renderCaisse();toast('Paiement confirmé — commande clôturée');}catch(error){toast('Paiement enregistré ; rechargez les données : '+error.message,'warning');}
}

function viewCommande(id){
  const c = db.commandes.find(x=>x.id===id);
  openModal('Commande '+c.numero, `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;background:var(--gold-soft);padding:12px;border-radius:8px;margin-bottom:12px">
      <div style="color:var(--muted)">Date</div><div><strong>${escapeHtml(fmtDateTime(c.date))}</strong></div>
      <div style="color:var(--muted)">Type</div><div>${escapeHtml(c.typeService||'—')}</div>
      <div style="color:var(--muted)">Table/Ch.</div><div>${escapeHtml(c.table||c.chambreId||'—')}</div>
      <div style="color:var(--muted)">Client</div><div>${escapeHtml(c.clientNom||'—')} ${c.couverts?`(${c.couverts} couverts)`:''}</div>
      <div style="color:var(--muted)">Serveur</div><div>${escapeHtml(c.serveur||'—')}</div>
      <div style="color:var(--muted)">Statut</div><div>${statutCmdBadge(c.statut)}</div>
    </div>
    <table>
      <thead><tr><th>Article</th><th>Qté</th><th>PU</th><th>Note</th><th>Total</th></tr></thead>
      <tbody>${(c.lignes||[]).map(l=>`<tr>
        <td>${escapeHtml(l.nom)}</td><td>${escapeHtml(l.qte)}</td><td>${escapeHtml(fmt(l.pu))}</td>
        <td style="font-size:11px;font-style:italic">${escapeHtml(l.note||'')}</td>
        <td>${escapeHtml(fmt(l.qte*l.pu))}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:12px;text-align:right">
      ${c.remise?`<div>Remise : -${escapeHtml(fmt(c.remise))}</div>`:''}
      ${c.pourboire?`<div>Pourboire : +${escapeHtml(fmt(c.pourboire))}</div>`:''}
      <div style="font-size:20px;font-weight:800;color:var(--brown-dark)">TOTAL : ${escapeHtml(fmt(c.total))}</div>
    </div>
    ${c.notesGen?`<div style="margin-top:10px;padding:8px;background:#fff9e6;border-radius:6px"><strong>Notes:</strong> ${escapeHtml(c.notesGen)}</div>`:''}
  `,`<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
     <button class="btn btn-gold" onclick="imprimerTicketCuisine('${escapeInline(id)}')">👨‍🍳 Ticket cuisine</button>
     <button class="btn btn-primary" onclick="imprimerFactureResto('${escapeInline(id)}')">🖨 Addition</button>`);
}

function deleteCmd(id){
  confirmDialog('Annuler cette commande ?',()=>{
    const c = db.commandes.find(x=>x.id===id);
    if(c){
      const t = db.tablesResto.find(x=>x.numero===c.table);
      if(t){ t.statut='libre'; delete t.commandeId; }
    }
    db.commandes = db.commandes.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB(); renderCommandes(); toast('Commande supprimée','warning');
  });
}

// ============ TICKETS IMPRIMABLES ============
function imprimerTicketCuisine(id){
  const c = db.commandes.find(x=>x.id===id);
  const cuisine = (c.lignes||[]).filter(l=>l.envoi!=='bar');
  const bar = (c.lignes||[]).filter(l=>l.envoi==='bar');
  const w = window.open('','_blank','width=400,height=600');
  const tickets = [
    {titre:'👨‍🍳 CUISINE', lignes:cuisine, couleur:'#5C3A1E'},
    {titre:'🍹 BAR', lignes:bar, couleur:'#8B5A2B'}
  ].filter(t=>t.lignes.length);
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket ${escapeHtml(c.numero)}</title>
    <style>
      body{font-family:'Courier New',monospace;padding:12px;font-size:14px;color:#000;width:280px;margin:0 auto}
      .ticket{border:2px dashed #333;padding:10px;margin-bottom:16px}
      h2{margin:0;text-align:center;font-size:16px}
      .head{text-align:center;border-bottom:1px dashed #333;padding-bottom:6px;margin-bottom:8px}
      table{width:100%;font-size:13px;margin-top:6px}
      td{padding:2px 0;vertical-align:top}
      .note{font-size:11px;font-style:italic;color:#666;padding-left:10px}
      .footer{text-align:center;font-size:11px;border-top:1px dashed #333;padding-top:6px;margin-top:8px}
    </style></head><body>
    ${tickets.map(t=>`
      <div class="ticket" style="border-color:${escapeHtml(t.couleur)}">
        <div class="head">
          <h2 style="color:${escapeHtml(t.couleur)}">${escapeHtml(t.titre)}</h2>
          <div><strong>${escapeHtml(c.numero)}</strong> — ${escapeHtml(new Date(c.date).toLocaleTimeString('fr-FR'))}</div>
          <div>${escapeHtml(c.typeService==='sur_place'?'🍽 Table '+(c.table||'—'):(c.typeService==='room_service'?'🛎 Room service':(c.typeService==='a_emporter'?'🥡 À emporter':'🛵 Livraison')))}</div>
          <div>Serveur: ${escapeHtml(c.serveur||'—')} • Couverts: ${escapeHtml(c.couverts||1)}</div>
        </div>
        <table>
          ${t.lignes.map(l=>`<tr>
            <td style="width:30px;font-size:18px;font-weight:800">${escapeHtml(l.qte)}×</td>
            <td>
              <strong>${escapeHtml(l.nom)}</strong>
              ${l.note?`<div class="note">→ ${escapeHtml(l.note)}</div>`:''}
            </td>
          </tr>`).join('')}
        </table>
        ${c.notesGen?`<div style="margin-top:6px;padding:4px;background:#fff9e6;font-size:11px">📝 ${escapeHtml(c.notesGen)}</div>`:''}
        <div class="footer">${escapeHtml(new Date().toLocaleString('fr-FR'))}</div>
      </div>
    `).join('')}
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
}

function imprimerFactureResto(id){
  const c = db.commandes.find(x=>x.id===id);
  const conf = db.config;
  const w = window.open('','_blank','width=380,height=700');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Addition ${escapeHtml(c.numero)}</title>
    <style>
      body{font-family:'Courier New',monospace;padding:12px;font-size:13px;color:#000;width:280px;margin:0 auto}
      .head{text-align:center;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:8px}
      h2{margin:0}
      table{width:100%;font-size:12px}
      td{padding:2px 0}
      .total{border-top:2px solid #333;padding-top:6px;margin-top:6px;font-size:14px}
      .footer{text-align:center;font-size:10px;border-top:1px dashed #333;padding-top:8px;margin-top:10px;color:#666}
    </style></head><body>
    <div class="head">
      <h2>${escapeHtml(conf.nom)}</h2>
      <div style="font-size:10px">${escapeHtml(conf.raison||'')}</div>
      <div style="font-size:10px">${escapeHtml(conf.adresse||'')}</div>
      <div style="font-size:10px">${escapeHtml(conf.tel||'')}</div>
      ${conf.rccm?`<div style="font-size:9px">RCCM: ${escapeHtml(conf.rccm)} • IFU: ${escapeHtml(conf.nif||'')}</div>`:''}
    </div>
    <div style="text-align:center;margin-bottom:6px">
      <strong>ADDITION</strong><br>
      <strong>${escapeHtml(c.numero)}</strong>
    </div>
    <table style="font-size:11px;margin-bottom:6px">
      <tr><td>Date :</td><td style="text-align:right">${escapeHtml(fmtDateTime(c.date))}</td></tr>
      <tr><td>Type :</td><td style="text-align:right">${escapeHtml(c.typeService||'—')}</td></tr>
      ${c.table?`<tr><td>Table :</td><td style="text-align:right">${escapeHtml(c.table)}</td></tr>`:''}
      ${c.clientNom?`<tr><td>Client :</td><td style="text-align:right">${escapeHtml(c.clientNom)}</td></tr>`:''}
      ${c.couverts?`<tr><td>Couverts :</td><td style="text-align:right">${escapeHtml(c.couverts)}</td></tr>`:''}
      <tr><td>Serveur :</td><td style="text-align:right">${escapeHtml(c.serveur||'—')}</td></tr>
    </table>
    <table style="border-top:1px dashed #333;padding-top:4px">
      ${(c.lignes||[]).map(l=>`
        <tr>
          <td colspan="2"><strong>${escapeHtml(l.qte)}× ${escapeHtml(l.nom)}</strong></td>
        </tr>
        <tr>
          <td style="padding-left:14px;font-size:11px">${escapeHtml(fmt(l.pu))}${escapeHtml(l.qte>1?' × '+l.qte:'')}</td>
          <td style="text-align:right">${escapeHtml(fmt(l.qte*l.pu))}</td>
        </tr>
      `).join('')}
    </table>
    <div class="total">
      <table>
        <tr><td>Sous-total :</td><td style="text-align:right">${escapeHtml(fmt(c.ssTotal||c.total))}</td></tr>
        ${c.remise?`<tr><td>Remise (${escapeHtml(c.remisePct)}%) :</td><td style="text-align:right">-${escapeHtml(fmt(c.remise))}</td></tr>`:''}
        ${c.pourboire?`<tr><td>Pourboire :</td><td style="text-align:right">+${escapeHtml(fmt(c.pourboire))}</td></tr>`:''}
        <tr style="font-size:16px;font-weight:800;border-top:2px solid #333"><td>TOTAL TTC :</td><td style="text-align:right">${escapeHtml(fmt(c.total))}</td></tr>
      </table>
      ${c.paiements?`<div style="font-size:11px;margin-top:6px">${c.paiements.map(p=>modeLabel(p.mode)+' : '+fmt(p.montant)).join('<br>')}</div>`:''}
    </div>
    <div class="footer">
      « ${escapeHtml(conf.slogan||'')} »<br>
      Merci de votre visite !<br>
      ${escapeHtml(new Date().toLocaleString('fr-FR'))}
    </div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
}

// ============ PLAN DE SALLE ============
function renderPlanSalle(){
  const zone = document.getElementById('tblZone')?.value||'';
  let list = (db.tablesResto||[]).filter(t=>!zone || t.zone===zone).sort((a,b)=>a.numero.localeCompare(b.numero));
  const colors = {
    libre:{bg:'#e8f5e9', border:'#4caf50', text:'#2e7d32'},
    occupee:{bg:'#ffebee', border:'#f44336', text:'#c62828'},
    reservee:{bg:'#fff8e1', border:'#ff9800', text:'#ef6c00'},
    prete:{bg:'#e3f2fd', border:'#2196f3', text:'#1565c0'},
    hors_service:{bg:'#f5f5f5', border:'#9e9e9e', text:'#616161'}
  };
  document.getElementById('planSalleGrid').innerHTML = list.length ? list.map(t=>{
    const c = colors[t.statut] || colors.libre;
    const cmd = t.commandeId ? db.commandes.find(x=>x.id===t.commandeId) : null;
    return `<div onclick="cliquerTable('${escapeInline(t.id)}')" style="background:${escapeHtml(c.bg)};border:3px solid ${escapeHtml(c.border)};border-radius:12px;padding:14px;cursor:pointer;text-align:center;color:${escapeHtml(c.text)};transition:transform .15s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
      <div style="font-size:24px;font-weight:900">${escapeHtml(t.numero)}</div>
      <div style="font-size:11px;margin-top:2px">${escapeHtml(t.zone)}</div>
      <div style="font-size:11px;margin-top:2px">👥 ${escapeHtml(t.capacite)} places</div>
      <div style="margin-top:8px;padding:4px;background:${escapeHtml(c.border)};color:#fff;border-radius:6px;font-size:11px;font-weight:700">${escapeHtml(statutTableLabel(t.statut))}</div>
      ${cmd?`<div style="margin-top:6px;font-size:11px;font-weight:700">${escapeHtml(cmd.numero)}<br>${escapeHtml(fmt(cmd.total))}</div>`:''}
    </div>`;
  }).join('') : '<div class="empty" style="grid-column:1/-1">Aucune table</div>';
}

function statutTableLabel(s){
  return ({libre:'LIBRE',occupee:'OCCUPÉE',reservee:'RÉSERVÉE',prete:'PRÊTE',hors_service:'HORS SERVICE'})[s]||s;
}

function cliquerTable(id){
  const t = db.tablesResto.find(x=>x.id===id);
  const cmd = t.commandeId ? db.commandes.find(x=>x.id===t.commandeId) : null;
  openModal('Table '+t.numero, `
    <div style="background:var(--gold-soft);padding:12px;border-radius:8px;margin-bottom:12px">
      <div><strong>Zone :</strong> ${escapeHtml(t.zone)}</div>
      <div><strong>Capacité :</strong> ${escapeHtml(t.capacite)} places</div>
      <div><strong>Statut :</strong> ${escapeHtml(statutTableLabel(t.statut))}</div>
      ${cmd?`<div><strong>Commande :</strong> ${escapeHtml(cmd.numero)} — ${escapeHtml(fmt(cmd.total))}</div>`:''}
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${t.statut==='libre'?`<button class="btn btn-primary" onclick="closeModal();prepareCmdPourTable('${escapeInline(t.numero)}')">🍽 Nouvelle commande sur cette table</button>`:''}
      ${cmd?`<button class="btn btn-gold" onclick="closeModal();viewCommande('${escapeInline(cmd.id)}')">👁 Voir la commande</button>`:''}
      ${cmd?`<button class="btn btn-green" onclick="closeModal();payerCmd('${escapeInline(cmd.id)}')">💰 Encaisser</button>`:''}
      <button class="btn btn-ghost" onclick="changerStatutTable('${escapeInline(t.id)}')">🔄 Changer statut</button>
      <button class="btn btn-ghost" onclick="editTable('${escapeInline(t.id)}')">✎ Modifier table</button>
      <button class="btn btn-danger" onclick="deleteTable('${escapeInline(t.id)}')">× Supprimer</button>
    </div>
  `,'<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>');
}

function prepareCmdPourTable(num){
  openCommandeModal();
  setTimeout(()=>{
    document.getElementById('cmdType2').value='sur_place';
    document.getElementById('cmdTable').value=num;
    onChangeTypeService();
  }, 60);
}

function changerStatutTable(id){
  const t = db.tablesResto.find(x=>x.id===id);
  const statuts = ['libre','occupee','reservee','prete','hors_service'];
  openModal('Changer le statut', `
    <div style="display:flex;flex-direction:column;gap:6px">
      ${statuts.map(s=>`<button class="btn ${escapeHtml(s===t.statut?'btn-primary':'btn-ghost')}" onclick="db.tablesResto.find(x=>x.id==='${escapeInline(id)}').statut='${escapeInline(s)}';saveDB();closeModal();renderPlanSalle();toast('Statut modifié')">${escapeHtml(statutTableLabel(s))}</button>`).join('')}
    </div>
  `,'<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>');
}

function openTableModal(id){
  const t = id ? db.tablesResto.find(x=>x.id===id) : null;
  openModal(id?'Modifier table':'Nouvelle table', `
    <form id="tbForm" onsubmit="saveTable(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Numéro *</label><input class="form-control" id="tbNum" required value="${escapeHtml(t?t.numero:'')}"></div>
        <div class="form-group"><label>Zone *</label>
          <select class="form-control" id="tbZone" required>
            ${['Salle principale','Terrasse','Salon VIP','Espace loisir'].map(z=>`<option ${escapeHtml(t&&t.zone===z?'selected':'')}>${escapeHtml(z)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Capacité *</label><input type="number" class="form-control" id="tbCap" required min="1" value="${escapeHtml(t?t.capacite:4)}"></div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="tbStat">
            ${['libre','occupee','reservee','prete','hors_service'].map(s=>`<option value="${escapeHtml(s)}" ${escapeHtml(t&&t.statut===s?'selected':'')}>${escapeHtml(statutTableLabel(s))}</option>`).join('')}
          </select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('tbForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveTable(e,id){
  e.preventDefault();
  const data = {
    numero:document.getElementById('tbNum').value,
    zone:document.getElementById('tbZone').value,
    capacite:parseInt(document.getElementById('tbCap').value)||4,
    statut:document.getElementById('tbStat').value
  };
  if(id) Object.assign(db.tablesResto.find(x=>x.id===id),data);
  else db.tablesResto.push({id:uid('tb'),...data});
  saveDB();closeModal();renderPlanSalle();toast('Table enregistrée');
}
function editTable(id){ closeModal(); setTimeout(()=>openTableModal(id),50); }
function deleteTable(id){
  confirmDialog('Supprimer cette table ?',()=>{
    db.tablesResto = db.tablesResto.filter(t=>t.id!==id);
    saveDB();closeModal();renderPlanSalle();toast('Supprimée','warning');
  });
}

// ============ KDS - KITCHEN DISPLAY ============
function renderCuisine(){
  const actives = db.commandes.filter(c=>['commandee','cuisine','prete'].includes(c.statut))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  const grid = document.getElementById('kdsGrid');
  if(!grid) return;
  grid.innerHTML = actives.length ? actives.map(c=>{
    const now = new Date();
    const cmdDate = new Date(c.date);
    const min = Math.floor((now - cmdDate)/60000);
    const alerte = min > 15;
    const color = c.statut==='commandee'?'#ff6b6b':(c.statut==='cuisine'?'#ffa726':'#66bb6a');
    return `<div style="background:#fff;border:3px solid ${escapeHtml(color)};border-radius:12px;padding:12px;box-shadow:0 4px 12px rgba(0,0,0,.08)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-weight:800;font-size:16px">${escapeHtml(c.numero)}</div>
          <div style="font-size:11px;color:var(--muted)">${escapeHtml(c.typeService==='sur_place'?'🍽 '+c.table:(c.typeService==='room_service'?'🛎 Room '+c.chambreId:c.typeService))}</div>
        </div>
        <div style="text-align:right">
          <div style="background:${escapeHtml(alerte?'#f44336':'#4caf50')};color:#fff;padding:4px 8px;border-radius:12px;font-weight:700;font-size:13px">${escapeHtml(min)}min</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">${escapeHtml(c.serveur||'—')}</div>
        </div>
      </div>
      <div style="border-top:1px dashed #ddd;padding-top:8px">
        ${(c.lignes||[]).filter(l=>l.envoi!=='bar').map(l=>`
          <div style="margin-bottom:4px">
            <span style="background:${escapeHtml(color)};color:#fff;padding:2px 6px;border-radius:4px;font-weight:700">${escapeHtml(l.qte)}×</span>
            <strong>${escapeHtml(l.nom)}</strong>
            ${l.note?`<div style="font-size:11px;color:var(--danger);padding-left:20px;font-style:italic">⚠ ${escapeHtml(l.note)}</div>`:''}
          </div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">
        ${c.statut==='commandee'?`<button class="btn btn-sm btn-gold" onclick="setStatutCmd('${escapeInline(c.id)}','cuisine')">▶ Démarrer</button>`:''}
        ${c.statut==='cuisine'?`<button class="btn btn-sm btn-green" onclick="setStatutCmd('${escapeInline(c.id)}','prete')">✓ Prête</button>`:''}
        ${c.statut==='prete'?`<button class="btn btn-sm btn-primary" onclick="setStatutCmd('${escapeInline(c.id)}','servie')">🍽 Servie</button>`:''}
        <button class="btn btn-sm btn-ghost" onclick="viewCommande('${escapeInline(c.id)}')">👁</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty" style="grid-column:1/-1;padding:40px;text-align:center"><div style="font-size:48px">👨‍🍳</div>Aucune commande en cuisine actuellement</div>';
}

// ============ RÉSERVATIONS TABLE ============
function renderReservationsResto(){
  const date = document.getElementById('resaDate')?.value||new Date().toISOString().slice(0,10);
  const st = document.getElementById('resaFilt')?.value||'';
  const list = (db.reservationsResto||[]).filter(r=>{
    if(r.date!==date) return false;
    if(st && r.statut!==st) return false;
    return true;
  }).sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
  document.getElementById('resaRestoTable').innerHTML = list.length ? list.map(r=>{
    const t = r.tableId ? db.tablesResto.find(x=>x.id===r.tableId) : null;
    return `<tr>
      <td><strong>${escapeHtml(r.ref)}</strong></td>
      <td>${escapeHtml(fmtDate(r.date))}<br><strong>${escapeHtml(r.heure)}</strong></td>
      <td>${escapeHtml(r.clientNom)}</td>
      <td>${escapeHtml(r.tel||'—')}</td>
      <td>${escapeHtml(r.nbPersonnes)}</td>
      <td>${escapeHtml(t?t.numero+' ('+t.zone+')':'—')}</td>
      <td>${statutResaResBadge(r.statut)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="honorerResa('${escapeInline(r.id)}')">✓ Honorer</button>
        <button class="btn btn-sm btn-ghost" onclick="editResaResto('${escapeInline(r.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="annulerResa('${escapeInline(r.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="empty">Aucune réservation ce jour</td></tr>';
}
function statutResaResBadge(s){
  const m = {confirmee:'Confirmée',attente:'En attente',honoree:'Honorée',annulee:'Annulée',no_show:'No-show'};
  const c = {confirmee:'success',attente:'gold',honoree:'info',annulee:'neutral',no_show:'danger'};
  return `<span class="badge badge-${escapeHtml(c[s]||'neutral')}">${escapeHtml(m[s]||s)}</span>`;
}
function openResaRestoModal(id){
  const r = id ? db.reservationsResto.find(x=>x.id===id) : null;
  const tables = db.tablesResto||[];
  openModal(id?'Modifier réservation':'📅 Nouvelle réservation table', `
    <form id="rrForm" onsubmit="saveResaResto(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Nom client *</label><input class="form-control" id="rrNom" required value="${escapeHtml(r?r.clientNom:'')}"></div>
        <div class="form-group"><label>Téléphone</label><input class="form-control" id="rrTel" value="${escapeHtml(r?r.tel||'':'')}"></div>
        <div class="form-group"><label>Date *</label><input type="date" class="form-control" id="rrDate" required value="${escapeHtml(r?r.date:new Date().toISOString().slice(0,10))}"></div>
        <div class="form-group"><label>Heure *</label><input type="time" class="form-control" id="rrHeure" required value="${escapeHtml(r?r.heure:'19:00')}"></div>
        <div class="form-group"><label>Nombre de personnes *</label><input type="number" class="form-control" id="rrNb" required min="1" value="${escapeHtml(r?r.nbPersonnes:2)}"></div>
        <div class="form-group"><label>Table souhaitée</label>
          <select class="form-control" id="rrTable">
            <option value="">Auto (attribuer plus tard)</option>
            ${tables.map(t=>`<option value="${escapeHtml(t.id)}" ${escapeHtml(r&&r.tableId===t.id?'selected':'')}>${escapeHtml(t.numero)} — ${escapeHtml(t.zone)} (${escapeHtml(t.capacite)}p)</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Statut</label>
          <select class="form-control" id="rrStat">
            ${['confirmee','attente','honoree','annulee','no_show'].map(s=>`<option value="${escapeHtml(s)}" ${escapeHtml(r&&r.statut===s?'selected':'')}>${escapeHtml(s)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full"><label>Occasion / Note</label>
          <textarea class="form-control" id="rrNote" rows="2">${escapeHtml(r?r.note||'':'')}</textarea>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('rrForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveResaResto(e,id){
  e.preventDefault();
  const data = {
    clientNom:document.getElementById('rrNom').value,
    tel:document.getElementById('rrTel').value,
    date:document.getElementById('rrDate').value,
    heure:document.getElementById('rrHeure').value,
    nbPersonnes:parseInt(document.getElementById('rrNb').value)||1,
    tableId:document.getElementById('rrTable').value,
    statut:document.getElementById('rrStat').value,
    note:document.getElementById('rrNote').value
  };
  if(id) Object.assign(db.reservationsResto.find(x=>x.id===id),data);
  else db.reservationsResto.push({id:uid('rr'),ref:'RRT-'+(1000+db.reservationsResto.length),...data});
  // Marquer table comme réservée
  if(data.tableId && data.statut==='confirmee'){
    const t = db.tablesResto.find(x=>x.id===data.tableId);
    if(t && t.statut==='libre') t.statut='reservee';
  }
  saveDB();closeModal();renderReservationsResto();toast('Réservation enregistrée');
}
function honorerResa(id){
  const r = db.reservationsResto.find(x=>x.id===id);
  r.statut='honoree'; saveDB(); renderReservationsResto(); toast('Réservation honorée');
}
function annulerResa(id){
  confirmDialog('Annuler cette réservation ?',()=>{
    const r = db.reservationsResto.find(x=>x.id===id);
    r.statut='annulee'; saveDB(); renderReservationsResto(); toast('Annulée','warning');
  });
}
function editResaResto(id){ openResaRestoModal(id); }

// ============ MENU (enrichi) ============
const _origRenderMenu = null;
window.renderMenu = function(){
  // Peupler filtre catégories dynamiques
  const catSel = document.getElementById('menuCat');
  if(catSel && catSel.options.length<=1){
    (db.categoriesMenu||[]).forEach(c=>{
      const o = document.createElement('option'); o.value=c.nom; o.textContent=c.nom; catSel.appendChild(o);
    });
  }
  const q = (document.getElementById('menuSearch')?.value||'').toLowerCase();
  const cat = document.getElementById('menuCat')?.value||'';
  const env = document.getElementById('menuEnvoi')?.value||'';
  const list = db.menu.filter(m=>{
    if(cat && m.categorie!==cat) return false;
    if(env && (m.envoi||'cuisine')!==env) return false;
    if(q && !m.nom.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=>(a.categorie||'').localeCompare(b.categorie||''));
  const el = document.getElementById('menuTable');
  if(!el) return;
  el.innerHTML = list.length ? list.map(m=>{
    const marge = m.cout ? Math.round((m.prix-m.cout)/m.prix*100) : null;
    return `<tr>
      <td><strong>${escapeHtml(m.nom)}</strong></td>
      <td><span class="badge badge-neutral">${escapeHtml(m.categorie)}</span></td>
      <td>${escapeHtml((m.envoi||'cuisine')==='bar'?'🍹 Bar':'👨‍🍳 Cuisine')}</td>
      <td style="font-weight:700">${escapeHtml(fmt(m.prix))}</td>
      <td>${escapeHtml(m.cout?fmt(m.cout):'—')}</td>
      <td>${marge!==null?`<span style="color:${escapeHtml(marge>50?'var(--success)':'var(--gold-dark)')};font-weight:600">${escapeHtml(marge)}%</span>`:'—'}</td>
      <td>${m.disponible?'<span class="badge badge-success">Oui</span>':'<span class="badge badge-danger">Non</span>'}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="toggleDispoMenu('${escapeInline(m.id)}')">🔄</button>
        <button class="btn btn-sm btn-ghost" onclick="editMenu('${escapeInline(m.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMenu('${escapeInline(m.id)}')">×</button>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="empty">Aucun article</td></tr>';
};

function editMenu(id){openMenuModal(id);}
function toggleDispoMenu(id){
  const m = db.menu.find(x=>x.id===id);
  m.disponible = !m.disponible;
  saveDB(); renderMenu(); toast(m.disponible?'Disponible':'Indisponible');
}

window.openMenuModal = function(id){
  const m = id ? db.menu.find(x=>x.id===id) : null;
  const cats = db.categoriesMenu||CATEGORIES_DEFAUT.map(n=>({nom:n}));
  openModal(id?'Modifier article':'🥗 Nouvel article', `
    <form id="mnForm" onsubmit="saveMenu(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Nom *</label><input class="form-control" id="mnNom" required value="${escapeHtml(m?m.nom:'')}"></div>
        <div class="form-group"><label>Catégorie *</label>
          <select class="form-control" id="mnCat" required>
            ${cats.map(c=>`<option ${escapeHtml(m&&m.categorie===c.nom?'selected':'')}>${escapeHtml(c.nom)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Envoi *</label>
          <select class="form-control" id="mnEnv">
            <option value="cuisine" ${escapeHtml(!m||m.envoi==='cuisine'?'selected':'')}>👨‍🍳 Cuisine</option>
            <option value="bar" ${escapeHtml(m&&m.envoi==='bar'?'selected':'')}>🍹 Bar</option>
          </select>
        </div>
        <div class="form-group"><label>Prix de vente (FCFA) *</label><input type="number" class="form-control" id="mnPrix" required min="0" value="${escapeHtml(m?m.prix:0)}"></div>
        <div class="form-group"><label>Coût matière</label><input type="number" class="form-control" id="mnCout" min="0" value="${escapeHtml(m?m.cout||0:0)}"></div>
        <div class="form-group"><label>Disponible</label>
          <select class="form-control" id="mnDispo">
            <option value="1" ${escapeHtml(!m||m.disponible?'selected':'')}>Oui</option>
            <option value="0" ${escapeHtml(m&&!m.disponible?'selected':'')}>Non</option>
          </select>
        </div>
        <div class="form-group full"><label>Description / composition</label>
          <textarea class="form-control" id="mnDesc" rows="2">${escapeHtml(m?m.description||'':'')}</textarea>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('mnForm').requestSubmit()">💾 Enregistrer</button>`);
};

const _origSaveMenu = null;
function deleteMenu(id){
  confirmDialog('Retirer cet article du menu ?',()=>{
    db.menu = db.menu.filter(x=>x.id!==id);
    // Deletion is committed atomically by the versioned synchronizer.
    saveDB(); renderMenu(); toast('Article retiré','warning');
  });
}
window.saveMenu = function(e,id){
  e.preventDefault();
  const data = {
    nom:document.getElementById('mnNom').value,
    categorie:document.getElementById('mnCat').value,
    envoi:document.getElementById('mnEnv').value,
    prix:parseFloat(document.getElementById('mnPrix').value)||0,
    cout:parseFloat(document.getElementById('mnCout').value)||0,
    disponible:document.getElementById('mnDispo').value==='1',
    description:document.getElementById('mnDesc').value
  };
  if(id) Object.assign(db.menu.find(x=>x.id===id),data);
  else db.menu.push({id:uid('mn'),...data});
  saveDB();closeModal();renderMenu();toast('Enregistré');
};

function openCategorieModal(){
  openModal('🏷 Gestion des catégories', `
    <div id="catList" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px">
      <input class="form-control" id="newCatNom" placeholder="Nouvelle catégorie">
      <select class="form-control" id="newCatEnvoi" style="width:130px">
        <option value="cuisine">👨‍🍳 Cuisine</option>
        <option value="bar">🍹 Bar</option>
      </select>
      <button class="btn btn-primary" onclick="ajouterCat()">+ Ajouter</button>
    </div>
  `,'<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>');
  refreshCatList();
}
function refreshCatList(){
  const el = document.getElementById('catList');
  el.innerHTML = (db.categoriesMenu||[]).map(c=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--gold-soft);border-radius:6px;margin-bottom:4px">
      <div><strong>${escapeHtml(c.nom)}</strong> <span style="font-size:11px;color:var(--muted)">(${escapeHtml(c.envoi==='bar'?'Bar':'Cuisine')})</span></div>
      <button class="btn btn-sm btn-danger" onclick="db.categoriesMenu=db.categoriesMenu.filter(x=>x.id!=='${escapeInline(c.id)}');saveDB();refreshCatList()">×</button>
    </div>
  `).join('');
}
function ajouterCat(){
  const nom = document.getElementById('newCatNom').value.trim();
  if(!nom) return;
  db.categoriesMenu.push({id:uid('ct'),nom,envoi:document.getElementById('newCatEnvoi').value});
  saveDB();document.getElementById('newCatNom').value='';refreshCatList();
}

// ============ FORMULES / MENU DU JOUR ============
function renderFormules(){
  const tp = document.getElementById('formType')?.value||'';
  const list = (db.formules||[]).filter(f=>!tp || f.type===tp);
  document.getElementById('formulesGrid').innerHTML = list.length ? list.map(f=>`
    <div style="background:linear-gradient(135deg,#fff 0%,var(--gold-soft) 100%);border:2px solid var(--gold);border-radius:12px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div>
          <div style="font-size:11px;color:var(--muted);letter-spacing:1px">${escapeHtml(f.type==='jour'?'MENU DU JOUR':(f.type==='formule'?'FORMULE':'ÉVÉNEMENTIEL'))}</div>
          <div style="font-size:18px;font-weight:800;color:var(--brown-dark)">${escapeHtml(f.nom)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:900;color:var(--gold-dark)">${escapeHtml(fmt(f.prix))}</div>
          ${f.actif?'<span class="badge badge-success">Actif</span>':'<span class="badge badge-neutral">Inactif</span>'}
        </div>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${escapeHtml(f.description||'')}</div>
      <div style="border-top:1px dashed var(--gold);padding-top:8px">
        ${(f.plats||[]).map(p=>`<div style="font-size:13px;padding:2px 0">• ${escapeHtml(p)}</div>`).join('')}
      </div>
      ${f.validite?`<div style="font-size:11px;color:var(--muted);margin-top:8px">Valide : ${escapeHtml(f.validite)}</div>`:''}
      <div style="margin-top:10px;display:flex;gap:6px">
        <button class="btn btn-sm btn-ghost" onclick="editFormule('${escapeInline(f.id)}')">✎</button>
        <button class="btn btn-sm btn-danger" onclick="deleteFormule('${escapeInline(f.id)}')">×</button>
      </div>
    </div>
  `).join('') : '<div class="empty" style="grid-column:1/-1">Aucune formule</div>';
}
function openFormuleModal(id){
  const f = id ? db.formules.find(x=>x.id===id) : null;
  openModal(id?'Modifier formule':'⭐ Nouvelle formule', `
    <form id="fmForm" onsubmit="saveFormule(event,'${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group full"><label>Nom *</label><input class="form-control" id="fmNom" required value="${escapeHtml(f?f.nom:'')}"></div>
        <div class="form-group"><label>Type *</label>
          <select class="form-control" id="fmType">
            <option value="jour" ${escapeHtml(f&&f.type==='jour'?'selected':'')}>Menu du jour</option>
            <option value="formule" ${escapeHtml(f&&f.type==='formule'?'selected':'')}>Formule</option>
            <option value="event" ${escapeHtml(f&&f.type==='event'?'selected':'')}>Événementiel</option>
          </select>
        </div>
        <div class="form-group"><label>Prix (FCFA) *</label><input type="number" class="form-control" id="fmPrix" required min="0" value="${escapeHtml(f?f.prix:5000)}"></div>
        <div class="form-group full"><label>Description</label>
          <textarea class="form-control" id="fmDesc" rows="2">${escapeHtml(f?f.description||'':'')}</textarea>
        </div>
        <div class="form-group full"><label>Plats inclus (un par ligne)</label>
          <textarea class="form-control" id="fmPlats" rows="4">${escapeHtml(f?(f.plats||[]).join('\n'):'')}</textarea>
        </div>
        <div class="form-group"><label>Validité</label><input class="form-control" id="fmValid" value="${escapeHtml(f?f.validite||'':'')}" placeholder="Ex: 12h-14h30"></div>
        <div class="form-group"><label>Actif</label>
          <select class="form-control" id="fmActif">
            <option value="1" ${escapeHtml(!f||f.actif?'selected':'')}>Oui</option>
            <option value="0" ${escapeHtml(f&&!f.actif?'selected':'')}>Non</option>
          </select>
        </div>
      </div>
    </form>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="document.getElementById('fmForm').requestSubmit()">💾 Enregistrer</button>`);
}
function saveFormule(e,id){
  e.preventDefault();
  const data = {
    nom:document.getElementById('fmNom').value,
    type:document.getElementById('fmType').value,
    prix:parseFloat(document.getElementById('fmPrix').value)||0,
    description:document.getElementById('fmDesc').value,
    plats:document.getElementById('fmPlats').value.split('\n').map(s=>s.trim()).filter(Boolean),
    validite:document.getElementById('fmValid').value,
    actif:document.getElementById('fmActif').value==='1'
  };
  if(id) Object.assign(db.formules.find(x=>x.id===id),data);
  else db.formules.push({id:uid('fm'),...data});
  saveDB();closeModal();renderFormules();toast('Formule enregistrée');
}
function editFormule(id){ openFormuleModal(id); }
function deleteFormule(id){
  confirmDialog('Supprimer cette formule ?',()=>{
    db.formules = db.formules.filter(f=>f.id!==id);
    saveDB();renderFormules();toast('Supprimée','warning');
  });
}

// ============ STATISTIQUES RESTAURANT ============
function renderStatsResto(){
  const du = document.getElementById('statDu')?.value||'';
  const au = document.getElementById('statAu')?.value||'';
  const list = db.commandes.filter(c=>{
    if(c.statut==='annulee') return false;
    const d = (c.date||'').slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    return true;
  });
  const ca = list.reduce((s,c)=>s+(c.total||0),0);
  const couverts = list.reduce((s,c)=>s+(c.couverts||1),0);
  document.getElementById('rstCATot').textContent = fmt(ca);
  document.getElementById('rstNbCmd').textContent = list.length;
  document.getElementById('rstCouverts').textContent = couverts;
  document.getElementById('rstTicket').textContent = list.length ? fmt(Math.round(ca/list.length)) : '0';

  // Top plats
  const parPlat = {};
  list.forEach(c=>(c.lignes||[]).forEach(l=>{
    if(!parPlat[l.nom]) parPlat[l.nom] = {qte:0, ca:0};
    parPlat[l.nom].qte += l.qte;
    parPlat[l.nom].ca += l.qte*l.pu;
  }));
  const topPlats = Object.entries(parPlat).sort((a,b)=>b[1].qte-a[1].qte).slice(0,10);
  document.getElementById('topPlats').innerHTML = topPlats.length ? topPlats.map(([n,v],i)=>`
    <tr>
      <td><strong>#${escapeHtml(i+1)}</strong></td>
      <td>${escapeHtml(n)}</td>
      <td>${escapeHtml(v.qte)}</td>
      <td>${escapeHtml(fmt(v.ca))}</td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="empty">—</td></tr>';

  // Serveurs
  const parServ = {};
  list.forEach(c=>{
    const s = c.serveur||'—';
    if(!parServ[s]) parServ[s] = {nb:0, ca:0};
    parServ[s].nb += 1;
    parServ[s].ca += c.total||0;
  });
  document.getElementById('statServeurs').innerHTML = Object.entries(parServ).sort((a,b)=>b[1].ca-a[1].ca).map(([n,v])=>`
    <tr>
      <td>${escapeHtml(n)}</td>
      <td>${escapeHtml(v.nb)}</td>
      <td>${escapeHtml(fmt(v.ca))}</td>
      <td>${escapeHtml(fmt(Math.round(v.ca/v.nb)))}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Types
  const parType = {};
  const totalCA = ca || 1;
  list.forEach(c=>{
    const t = c.typeService||'—';
    if(!parType[t]) parType[t] = {nb:0, ca:0};
    parType[t].nb += 1;
    parType[t].ca += c.total||0;
  });
  const typeLabels = {sur_place:'🍽 Sur place',a_emporter:'🥡 À emporter',livraison:'🛵 Livraison',room_service:'🛎 Room service'};
  document.getElementById('statTypes').innerHTML = Object.entries(parType).sort((a,b)=>b[1].ca-a[1].ca).map(([t,v])=>`
    <tr>
      <td>${escapeHtml(typeLabels[t]||t)}</td>
      <td>${escapeHtml(v.nb)}</td>
      <td>${escapeHtml(fmt(v.ca))}</td>
      <td>${escapeHtml((v.ca/totalCA*100).toFixed(1))}%</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Créneaux
  const creneaux = {'06h-11h':0,'11h-15h':0,'15h-19h':0,'19h-23h':0,'23h-06h':0};
  const caCren = {'06h-11h':0,'11h-15h':0,'15h-19h':0,'19h-23h':0,'23h-06h':0};
  list.forEach(c=>{
    const h = new Date(c.date).getHours();
    const k = h<6?'23h-06h':(h<11?'06h-11h':(h<15?'11h-15h':(h<19?'15h-19h':(h<23?'19h-23h':'23h-06h'))));
    creneaux[k]++; caCren[k]+=(c.total||0);
  });
  document.getElementById('statCreneaux').innerHTML = Object.entries(creneaux).map(([k,v])=>`
    <tr>
      <td><strong>${escapeHtml(k)}</strong></td>
      <td>${escapeHtml(v)}</td>
      <td>${escapeHtml(fmt(caCren[k]))}</td>
    </tr>
  `).join('');
}





// ============================================================
// ============ FACTURES / PROFORMAS / DEVIS ============
// ============================================================

const DOC_TYPES = {
  facture:  {label:'Facture',          prefix:'FAC', color:'#5C3A1E', showPayment:true,  validity:0},
  proforma: {label:'Facture Proforma', prefix:'PRO', color:'#8B5A2B', showPayment:false, validity:30},
  devis:    {label:'Devis',            prefix:'DEV', color:'#1F4A2B', showPayment:false, validity:15}
};

function initFactPage(){
  renderFactures();
  renderProformas();
  renderDevis();
}

function switchFactTab(t){
  document.querySelectorAll('[data-facttab]').forEach(el=>el.classList.toggle('active',el.dataset.facttab===t));
  ['factures','proformas','devis'].forEach(k=>{
    const el = document.getElementById('fact-'+k);
    if(el) el.style.display = k===t?'block':'none';
  });
  if(t==='factures') renderFactures();
  else if(t==='proformas') renderProformas();
  else if(t==='devis') renderDevis();
}

// ============ MODALE UNIFIÉE ============
let _docLignes = [];
let _docType = 'facture';

function openDocModal(type, id){
  _docType = type;
  const cfg = DOC_TYPES[type];
  const col = type==='facture' ? 'factures' : (type==='proforma' ? 'proformas' : 'devis');
  const doc = id ? db[col].find(x=>x.id===id) : null;
  _docLignes = doc ? JSON.parse(JSON.stringify(doc.lignes||[])) : [];

  const today = new Date().toISOString().slice(0,10);
  const validite = new Date(); validite.setDate(validite.getDate()+cfg.validity);
  const validityDate = doc?.validite || validite.toISOString().slice(0,10);

  const clientsOpts = db.clients.map(c=>`<option value="${escapeHtml(c.id)}" ${escapeHtml(doc&&doc.clientId===c.id?'selected':'')}>${escapeHtml(c.prenom)} ${escapeHtml(c.nom)} — ${escapeHtml(c.ville||'')}</option>`).join('');
  const menuOpts = db.menu.filter(m=>m.disponible).map(m=>`<option value="menu:${escapeHtml(m.id)}" data-prix="${escapeHtml(m.prix)}" data-des="${escapeHtml(m.nom)}">${escapeHtml(m.nom)} (${escapeHtml(fmt(m.prix))})</option>`).join('');
  const chambresOpts = db.chambres.map(c=>`<option value="ch:${escapeHtml(c.id)}" data-prix="${escapeHtml(c.prix)}" data-des="Nuitée Ch. ${escapeHtml(c.numero)} - ${escapeHtml(c.type)}">Ch. ${escapeHtml(c.numero)} — ${escapeHtml(c.type)} (${escapeHtml(fmt(c.prix))}/nuit)</option>`).join('');
  const sallesOpts = db.salles.map(s=>`<option value="sl:${escapeHtml(s.id)}" data-prix="${escapeHtml(s.tarif)}" data-des="Location ${escapeHtml(s.nom)}">${escapeHtml(s.nom)} (${escapeHtml(fmt(s.tarif))})</option>`).join('');

  openModal(`${cfg.label==='Facture Proforma'?'📄':cfg.label==='Devis'?'📋':'🧾'} ${id?'Modifier':'Nouveau'} ${cfg.label}`, `
    <form id="docForm" onsubmit="saveDoc(event,'${escapeInline(type)}','${escapeInline(id||'')}')">
      <div class="form-grid">
        <div class="form-group"><label>Date *</label>
          <input type="date" class="form-control" id="docDate" required value="${escapeHtml(doc?doc.date:today)}">
        </div>
        <div class="form-group"><label>N° pièce</label>
          <input class="form-control" id="docNum" value="${escapeHtml(doc?doc.numero:'')}" placeholder="Auto si vide">
        </div>
        ${type!=='facture' ? `
        <div class="form-group"><label>Valide jusqu'au</label>
          <input type="date" class="form-control" id="docValid" value="${escapeHtml(validityDate)}">
        </div>` : ''}
        <div class="form-group"><label>Type de prestation *</label>
          <select class="form-control" id="docTypePresta" required>
            <option value="hebergement" ${escapeHtml(doc&&doc.type==='hebergement'?'selected':'')}>🛏 Hébergement</option>
            <option value="restauration" ${escapeHtml(doc&&doc.type==='restauration'?'selected':'')}>🍽 Restauration</option>
            <option value="salle" ${escapeHtml(doc&&doc.type==='salle'?'selected':'')}>🏛 Location salle</option>
            <option value="magasin" ${escapeHtml(doc&&doc.type==='magasin'?'selected':'')}>🏪 Location magasin</option>
            <option value="mixte" ${escapeHtml(doc&&doc.type==='mixte'?'selected':'')}>🎯 Prestation mixte</option>
            <option value="autres" ${escapeHtml(doc&&doc.type==='autres'?'selected':'')}>📦 Autres</option>
          </select>
        </div>
        <div class="form-group full"><label>Client *</label>
          <select class="form-control" id="docClient" onchange="onDocClientChange()">
            <option value="">— Client hors fichier (saisir nom ci-dessous) —</option>
            ${clientsOpts}
          </select>
        </div>
        <div class="form-group"><label>Nom client (si hors fichier)</label>
          <input class="form-control" id="docClientNom" value="${escapeHtml(doc?doc.clientNom||'':'')}" placeholder="Nom complet ou raison sociale">
        </div>
        <div class="form-group"><label>Contact / Téléphone</label>
          <input class="form-control" id="docClientTel" value="${escapeHtml(doc?doc.clientTel||'':'')}">
        </div>
        <div class="form-group full"><label>Objet / Référence</label>
          <input class="form-control" id="docObjet" value="${escapeHtml(doc?doc.objet||'':'')}" placeholder="Ex: Séjour du 15-20/09 - Événement AG mensuelle...">
        </div>
      </div>

      <h4 style="margin:16px 0 8px;color:var(--brown-dark)">📝 Lignes de prestation</h4>
      <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap">
        <div class="form-group" style="flex:2;min-width:200px"><label>Article prédéfini</label>
          <select class="form-control" id="docItemSel" onchange="prefillDocLigne()">
            <option value="">— Sélection rapide ou saisie libre ci-dessous —</option>
            <optgroup label="🛏 Chambres">${chambresOpts}</optgroup>
            <optgroup label="🏛 Salles">${sallesOpts}</optgroup>
            <optgroup label="🍽 Menu">${menuOpts}</optgroup>
          </select>
        </div>
        <div class="form-group" style="flex:2;min-width:200px"><label>Désignation *</label>
          <input class="form-control" id="docDesig" placeholder="Prestation">
        </div>
        <div class="form-group"><label>Qté</label>
          <input type="number" class="form-control" id="docQte" value="1" min="1" style="width:70px">
        </div>
        <div class="form-group"><label>P.U. HT (FCFA)</label>
          <input type="number" class="form-control" id="docPu" value="0" min="0" style="width:110px">
        </div>
        <button type="button" class="btn btn-gold" onclick="addDocLigne()">+ Ajouter ligne</button>
      </div>

      <div class="table-wrap" style="margin-top:12px">
        <table>
          <thead><tr><th>#</th><th>Désignation</th><th>Qté</th><th>P.U. HT</th><th>Total HT</th><th></th></tr></thead>
          <tbody id="docLignesBody"></tbody>
        </table>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div style="background:var(--gold-soft);padding:12px;border-radius:8px">
          <div class="form-group"><label>Remise globale (%)</label>
            <input type="number" class="form-control" id="docRemise" min="0" max="100" value="${escapeHtml(doc?doc.remisePct||0:0)}" oninput="refreshDocTotals()">
          </div>
          <div class="form-group"><label>TVA applicable (%)</label>
            <input type="number" class="form-control" id="docTva" min="0" step="0.5" value="${escapeHtml(doc?doc.tvaPct!==undefined?doc.tvaPct:db.config.tva:db.config.tva)}" oninput="refreshDocTotals()">
          </div>
          ${type==='facture' ? `
          <div class="form-group"><label>Montant déjà payé</label>
            <input type="number" class="form-control" id="docPaye" min="0" readonly value="${escapeHtml(doc?doc.paye||0:0)}"><small>Les paiements se saisissent avec le bouton Encaisser.</small>
          </div>` : ''}
        </div>
        <div style="background:var(--brown-dark);color:#fff;padding:14px;border-radius:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Sous-total HT</span><strong id="docSsHT">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Remise</span><strong id="docRemMt" style="color:#ffcccc">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Base HT</span><strong id="docBaseHT">0</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>TVA</span><strong id="docTvaMt">0</strong></div>
          <hr style="border-color:#8B5A2B;margin:8px 0">
          <div style="display:flex;justify-content:space-between;font-size:20px"><span>TOTAL TTC</span><strong id="docTotal" style="color:var(--gold)">0 FCFA</strong></div>
        </div>
      </div>

      <div class="form-group" style="margin-top:12px"><label>Conditions / Notes</label>
        <textarea class="form-control" id="docNotes" rows="2" placeholder="${escapeHtml(type==='devis'?'Ex: Validité 15 jours. Acompte 30%. Livraison sous 7 jours.':(type==='proforma'?'Ex: À régler avant démarrage prestation.':''))}"">${escapeHtml(doc?doc.notes||'':'')}</textarea>
      </div>
    </form>
  `, `
    <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="document.getElementById('docForm').requestSubmit()">💾 Enregistrer</button>
  `);
  document.getElementById('modalBox').classList.add('lg');
  setTimeout(refreshDocTotals, 50);
}

function onDocClientChange(){
  const id = document.getElementById('docClient').value;
  if(!id) return;
  const c = db.clients.find(x=>x.id===id);
  if(c){
    document.getElementById('docClientNom').value = c.prenom+' '+c.nom;
    document.getElementById('docClientTel').value = c.tel||'';
  }
}

function prefillDocLigne(){
  const sel = document.getElementById('docItemSel');
  if(!sel.value) return;
  const opt = sel.options[sel.selectedIndex];
  document.getElementById('docDesig').value = opt.dataset.des||opt.textContent;
  document.getElementById('docPu').value = opt.dataset.prix||0;
}

function addDocLigne(){
  const des = document.getElementById('docDesig').value.trim();
  const qte = parseFloat(document.getElementById('docQte').value)||0;
  const pu = parseFloat(document.getElementById('docPu').value)||0;
  if(!des){ toast('Désignation obligatoire','warning'); return; }
  if(qte<=0){ toast('Quantité doit être > 0','warning'); return; }
  _docLignes.push({designation:des, qte, pu, total: qte*pu});
  document.getElementById('docItemSel').value='';
  document.getElementById('docDesig').value='';
  document.getElementById('docQte').value=1;
  document.getElementById('docPu').value=0;
  refreshDocTotals();
}

function refreshDocTotals(){
  const ssHT = _docLignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const remPct = parseFloat(document.getElementById('docRemise')?.value)||0;
  const tvaPct = parseFloat(document.getElementById('docTva')?.value)||0;
  const remMt = Math.round(ssHT*remPct/100);
  const baseHT = ssHT - remMt;
  const tvaMt = Math.round(baseHT*tvaPct/100);
  const total = baseHT + tvaMt;

  document.getElementById('docLignesBody').innerHTML = _docLignes.length ? _docLignes.map((l,i)=>`
    <tr>
      <td>${escapeHtml(i+1)}</td>
      <td>${escapeHtml(l.designation)}</td>
      <td>${escapeHtml(l.qte)}</td>
      <td>${escapeHtml(fmt(l.pu))}</td>
      <td style="font-weight:700">${escapeHtml(fmt(l.qte*l.pu))}</td>
      <td><button type="button" class="btn btn-sm btn-danger" onclick="_docLignes.splice(${escapeInline(i)},1);refreshDocTotals()">×</button></td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="empty">Aucune ligne</td></tr>';

  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent = fmt(v); };
  set('docSsHT', ssHT);
  set('docRemMt', remMt);
  set('docBaseHT', baseHT);
  set('docTvaMt', tvaMt);
  set('docTotal', total);
}

function saveDoc(e, type, id){
  e.preventDefault();
  if(!_docLignes.length){ toast('Ajoutez au moins une ligne','warning'); return; }

  const ssHT = _docLignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const remPct = parseFloat(document.getElementById('docRemise').value)||0;
  const tvaPct = parseFloat(document.getElementById('docTva').value)||0;
  const remMt = Math.round(ssHT*remPct/100);
  const baseHT = ssHT - remMt;
  const tvaMt = Math.round(baseHT*tvaPct/100);
  const total = baseHT + tvaMt;

  if(!Number.isFinite(total)||total<0||!Number.isFinite(remPct)||remPct<0||remPct>100||!Number.isFinite(tvaPct)||tvaPct<0||tvaPct>100||_docLignes.some(l=>!Number.isFinite(l.qte)||l.qte<=0||!Number.isFinite(l.pu)||l.pu<0)){toast('Vérifiez les montants, quantités et taux','warning');return;}
  if(type==='facture'&&id&&(db.factures.find(f=>f.id===id)?.paye>0||db.factures.find(f=>f.id===id)?.refResa)){toast('Une facture encaissée ne peut pas être modifiée','warning');return;}
  const cfg = DOC_TYPES[type];
  const col = type==='facture'?'factures':(type==='proforma'?'proformas':'devis');
  const paye = type==='facture' ? (parseFloat(document.getElementById('docPaye').value)||0) : 0;
  const statutInit = type==='facture'
      ? (paye>=total?'paye':(paye>0?'partiel':'impaye'))
      : (type==='proforma'?'en_attente':'brouillon');

  const data = {
    numero: document.getElementById('docNum').value.trim() || `${cfg.prefix}-${new Date().getFullYear()}-${String(db[col].length+1).padStart(4,'0')}`,
    date: document.getElementById('docDate').value,
    validite: document.getElementById('docValid')?.value || '',
    type: document.getElementById('docTypePresta').value,
    clientId: document.getElementById('docClient').value || null,
    clientNom: document.getElementById('docClientNom').value,
    clientTel: document.getElementById('docClientTel').value,
    objet: document.getElementById('docObjet').value,
    lignes: _docLignes.map(l=>({...l, total: l.qte*l.pu})),
    ssTotal: ssHT,
    remisePct: remPct,
    remise: remMt,
    totalHT: baseHT,
    tvaPct,
    tva: tvaMt,
    total,
    paye,
    notes: document.getElementById('docNotes').value,
    statut: statutInit
  };

  if(id){
    Object.assign(db[col].find(x=>x.id===id), data);
  } else {
    data.id = uid(cfg.prefix.toLowerCase());
    db[col].push(data);
  }
  saveDB(); closeModal();
  if(type==='facture'){ renderFactures(); toast('Facture enregistrée'); }
  else if(type==='proforma'){ renderProformas(); toast('Proforma enregistrée'); }
  else { renderDevis(); toast('Devis enregistré'); }
  // Proposer impression
  setTimeout(()=>{ if(confirm(`Imprimer la ${cfg.label.toLowerCase()} maintenant ?`)) imprimerDoc(data.id, type); }, 300);
}

// ============ RENDUS ============
function renderProformas(){
  const q = (document.getElementById('profSearch')?.value||'').toLowerCase();
  const st = document.getElementById('profStatus')?.value||'';
  const list = [...db.proformas].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(p=>{
    if(st && p.statut!==st) return false;
    if(q && !(p.numero+' '+(p.clientNom||'')+' '+(p.objet||'')).toLowerCase().includes(q)) return false;
    return true;
  });
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent = v; };
  set('profNbAtt', db.proformas.filter(p=>p.statut==='en_attente').length);
  set('profNbAcc', db.proformas.filter(p=>p.statut==='acceptee').length);
  set('profNbConv', db.proformas.filter(p=>p.statut==='convertie').length);
  set('profMontant', fmt(db.proformas.filter(p=>['en_attente','acceptee'].includes(p.statut)).reduce((s,p)=>s+p.total,0)));

  document.getElementById('proformasTable').innerHTML = list.length ? list.map(p=>`
    <tr>
      <td><strong>${escapeHtml(p.numero)}</strong></td>
      <td>${escapeHtml(fmtDate(p.date))}</td>
      <td style="font-size:12px">${escapeHtml(p.validite?fmtDate(p.validite):'—')}</td>
      <td>${escapeHtml(p.clientNom||'—')}</td>
      <td style="font-size:12px">${escapeHtml((p.objet||'').slice(0,50))}${escapeHtml((p.objet||'').length>50?'…':'')}</td>
      <td style="font-weight:700">${escapeHtml(fmt(p.total))}</td>
      <td>${statutDocBadge('proforma',p.statut)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm btn-ghost" onclick="viewDoc('${escapeInline(p.id)}','proforma')" title="Voir">👁</button>
        <button class="btn btn-sm btn-primary" onclick="openDocModal('proforma','${escapeInline(p.id)}')" title="Modifier">✎</button>
        <button class="btn btn-sm btn-gold" onclick="imprimerDoc('${escapeInline(p.id)}','proforma')" title="Imprimer">🖨</button>
        ${p.statut!=='convertie'?`<button class="btn btn-sm btn-green" onclick="convertirEnFacture('${escapeInline(p.id)}','proforma')" title="Convertir en facture">→🧾</button>`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteDoc('${escapeInline(p.id)}','proforma')">×</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8" class="empty">Aucune proforma</td></tr>';
}

function renderDevis(){
  const q = (document.getElementById('devSearch')?.value||'').toLowerCase();
  const st = document.getElementById('devStatus')?.value||'';
  const list = [...db.devis].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(d=>{
    if(st && d.statut!==st) return false;
    if(q && !(d.numero+' '+(d.clientNom||'')+' '+(d.objet||'')).toLowerCase().includes(q)) return false;
    return true;
  });
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent = v; };
  const total = db.devis.length || 1;
  const conv = db.devis.filter(d=>d.statut==='convertie').length;
  set('devNbAtt', db.devis.filter(d=>['brouillon','envoye'].includes(d.statut)).length);
  set('devNbAcc', db.devis.filter(d=>d.statut==='accepte').length);
  set('devNbConv', conv);
  set('devTaux', Math.round(conv/total*100)+'%');

  document.getElementById('devisTable').innerHTML = list.length ? list.map(d=>`
    <tr>
      <td><strong>${escapeHtml(d.numero)}</strong></td>
      <td>${escapeHtml(fmtDate(d.date))}</td>
      <td style="font-size:12px">${escapeHtml(d.validite?fmtDate(d.validite):'—')}</td>
      <td>${escapeHtml(d.clientNom||'—')}</td>
      <td style="font-size:12px">${escapeHtml((d.objet||'').slice(0,50))}${escapeHtml((d.objet||'').length>50?'…':'')}</td>
      <td style="font-weight:700">${escapeHtml(fmt(d.total))}</td>
      <td>${statutDocBadge('devis',d.statut)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm btn-ghost" onclick="viewDoc('${escapeInline(d.id)}','devis')" title="Voir">👁</button>
        <button class="btn btn-sm btn-primary" onclick="openDocModal('devis','${escapeInline(d.id)}')" title="Modifier">✎</button>
        <button class="btn btn-sm btn-gold" onclick="imprimerDoc('${escapeInline(d.id)}','devis')" title="Imprimer">🖨</button>
        ${d.statut!=='convertie'?`<button class="btn btn-sm btn-green" onclick="convertirEnFacture('${escapeInline(d.id)}','devis')" title="Convertir en facture">→🧾</button>`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteDoc('${escapeInline(d.id)}','devis')">×</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8" class="empty">Aucun devis</td></tr>';
}

function statutDocBadge(type, s){
  const maps = {
    proforma: {en_attente:{lib:'En attente',c:'#1976d2',bg:'#e3f2fd'},acceptee:{lib:'Acceptée',c:'#2e7d32',bg:'#e8f5e9'},convertie:{lib:'Convertie',c:'#c17d00',bg:'#fff8e1'},expiree:{lib:'Expirée',c:'#666',bg:'#f5f5f5'},refusee:{lib:'Refusée',c:'#c62828',bg:'#ffebee'}},
    devis: {brouillon:{lib:'Brouillon',c:'#666',bg:'#f5f5f5'},envoye:{lib:'Envoyé',c:'#1976d2',bg:'#e3f2fd'},accepte:{lib:'Accepté',c:'#2e7d32',bg:'#e8f5e9'},convertie:{lib:'Converti',c:'#c17d00',bg:'#fff8e1'},refuse:{lib:'Refusé',c:'#c62828',bg:'#ffebee'},expire:{lib:'Expiré',c:'#666',bg:'#f5f5f5'}}
  };
  const b = maps[type]?.[s] || {lib:s,c:'#666',bg:'#f5f5f5'};
  return `<span style="padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;color:${escapeHtml(b.c)};background:${escapeHtml(b.bg)}">${escapeHtml(b.lib)}</span>`;
}

// ============ VOIR / IMPRIMER ============
function viewDoc(id, type){
  const col = type==='facture'?'factures':(type==='proforma'?'proformas':'devis');
  const doc = db[col].find(x=>x.id===id);
  if(!doc) return;
  const c = doc.clientId ? db.clients.find(x=>x.id===doc.clientId) : null;
  const cfg = DOC_TYPES[type];
  openModal(`${cfg.label} ${doc.numero}`, docHTML(doc, type, c, false), `
    <button class="btn btn-ghost" onclick="closeModal()">Fermer</button>
    <button class="btn btn-gold" onclick="imprimerDoc('${escapeInline(id)}','${escapeInline(type)}')">🖨 Imprimer</button>
    ${doc.statut!=='convertie' && type!=='facture' ? `<button class="btn btn-green" onclick="convertirEnFacture('${escapeInline(id)}','${escapeInline(type)}')">→ 🧾 Convertir en facture</button>` : ''}
  `);
  document.getElementById('modalBox').classList.add('lg');
}

function docHTML(doc, type, client, forPrint){
  const cfg = DOC_TYPES[type];
  const conf = db.config;
  const title = cfg.label.toUpperCase();
  return `<div class="invoice" id="docPrint" style="${escapeHtml(forPrint?'':'')}">
    <div class="invoice-header">
      <div class="invoice-logo">
        <h2>${escapeHtml(conf.raison||conf.nom)}</h2>
        <p style="font-weight:600;color:var(--gold-dark);font-size:14px">${escapeHtml(conf.nom)}</p>
        <p>${escapeHtml(conf.adresse)}</p>
        <p>${escapeHtml(conf.tel)}</p>
        <p>${escapeHtml(conf.email)}${escapeHtml(conf.site?' • '+conf.site:'')}</p>
      </div>
      <div class="invoice-title">
        <h3 style="color:${escapeHtml(cfg.color)}">${escapeHtml(title)}</h3>
        <p><strong>${escapeHtml(doc.numero)}</strong></p>
        <p>Date : ${escapeHtml(fmtDate(doc.date))}</p>
        ${doc.validite ? `<p style="color:#c62828;font-weight:600">Valide jusqu'au : ${escapeHtml(fmtDate(doc.validite))}</p>` : ''}
      </div>
    </div>
    <div class="invoice-info">
      <div class="section">
        <h5>${escapeHtml(type==='facture'?'FACTURÉ À':(type==='proforma'?'PROFORMA À L\'ATTENTION DE':'DEVIS À L\'ATTENTION DE'))}</h5>
        <div style="font-weight:600;font-size:14px">${escapeHtml(client?client.prenom+' '+client.nom:(doc.clientNom||'Client'))}</div>
        ${client?`<div>${escapeHtml(client.tel||'')}</div><div>${escapeHtml(client.email||'')}</div><div>${escapeHtml(client.ville||'')}</div>`:''}
        ${doc.clientTel&&!client?`<div>${escapeHtml(doc.clientTel)}</div>`:''}
      </div>
      <div class="section">
        <h5>OBJET DE LA PRESTATION</h5>
        <div><strong>${escapeHtml(({hebergement:'🛏 Hébergement',restauration:'🍽 Restauration',salle:'🏛 Location salle',magasin:'🏪 Location magasin',mixte:'🎯 Prestation mixte',autres:'📦 Autres'})[doc.type]||doc.type)}</strong></div>
        ${doc.objet?`<div style="margin-top:4px;font-size:13px">${escapeHtml(doc.objet)}</div>`:''}
        ${type==='facture'?`<div style="margin-top:6px">Statut : ${statutBadge(doc.statut)}</div>`:''}
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Désignation</th><th style="text-align:center">Qté</th><th style="text-align:right">P.U. HT</th><th style="text-align:right">Total HT</th></tr></thead>
      <tbody>
        ${doc.lignes.map((l,i)=>`<tr>
          <td>${escapeHtml(i+1)}</td>
          <td>${escapeHtml(l.designation)}</td>
          <td style="text-align:center">${escapeHtml(l.qte)}</td>
          <td style="text-align:right">${escapeHtml(fmt(l.pu))}</td>
          <td style="text-align:right;font-weight:600">${escapeHtml(fmt(l.qte*l.pu))}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="invoice-totals">
      <table>
        <tr><td>Sous-total HT</td><td style="text-align:right">${escapeHtml(fmt(doc.ssTotal||doc.totalHT))}</td></tr>
        ${doc.remise?`<tr><td>Remise (${escapeHtml(doc.remisePct)}%)</td><td style="text-align:right;color:#c62828">-${escapeHtml(fmt(doc.remise))}</td></tr>`:''}
        <tr><td>Base HT</td><td style="text-align:right">${escapeHtml(fmt(doc.totalHT))}</td></tr>
        <tr><td>TVA (${escapeHtml(doc.tvaPct!==undefined?doc.tvaPct:conf.tva)}%)</td><td style="text-align:right">${escapeHtml(fmt(doc.tva))}</td></tr>
        <tr class="total-row"><td>TOTAL TTC</td><td style="text-align:right">${escapeHtml(fmt(doc.total))}</td></tr>
        ${type==='facture'?`
          <tr><td>Payé</td><td style="text-align:right;color:var(--success)">${escapeHtml(fmt(doc.paye))}</td></tr>
          <tr><td>Reste à payer</td><td style="text-align:right;color:var(--danger);font-weight:700">${escapeHtml(fmt(doc.total-doc.paye))}</td></tr>
        `:''}
      </table>
    </div>
    ${doc.notes?`<div style="margin-top:16px;padding:12px;background:#FDF8EF;border-radius:8px"><strong>Conditions / Notes :</strong><br>${doc.notes.replace(/\n/g,'<br>')}</div>`:''}
    ${type==='proforma'?`<div style="margin-top:14px;padding:12px;background:#fff8e1;border-left:4px solid #D4A017;border-radius:6px;font-size:12px">
      ℹ Cette proforma n'est pas une facture définitive. Elle sert de document préparatoire à la facturation.
    </div>`:''}
    ${type==='devis'?`<div style="margin-top:14px;padding:12px;background:#e8f5e9;border-left:4px solid #1F4A2B;border-radius:6px;font-size:12px">
      📝 Devis valable ${escapeHtml(doc.validite?'jusqu\'au '+fmtDate(doc.validite):'30 jours')}. Bon pour accord — Signature client précédée de la mention manuscrite « Bon pour accord » :
      <div style="display:flex;gap:20px;margin-top:16px">
        <div style="flex:1;border-top:1px solid #333;padding-top:6px;font-size:11px">Le prestataire<br><br><br></div>
        <div style="flex:1;border-top:1px solid #333;padding-top:6px;font-size:11px">Le client<br>Date, signature<br><br></div>
      </div>
    </div>`:''}
    <div class="invoice-footer">
      <p style="font-style:italic;color:var(--brown-dark)">« ${escapeHtml(conf.slogan||'')} »</p>
      <p style="font-size:11px">${escapeHtml(conf.rccm?'RCCM: '+conf.rccm:'')}${escapeHtml(conf.nif?' • IFU: '+conf.nif:'')}${escapeHtml(conf.bcb?' • BCB: '+conf.bcb:'')}</p>
      ${conf.agrement?`<p style="font-size:11px">Agrément: ${escapeHtml(conf.agrement)}</p>`:''}
      <p style="margin-top:8px">${escapeHtml(type==='facture'?'Merci de votre confiance':(type==='devis'?'Merci pour l\'intérêt porté à nos services':'Nous restons à votre disposition'))}</p>
    </div>
  </div>`;
}

function imprimerDoc(id, type){
  const col = type==='facture'?'factures':(type==='proforma'?'proformas':'devis');
  const doc = db[col].find(x=>x.id===id);
  if(!doc) return;
  const c = doc.clientId ? db.clients.find(x=>x.id===doc.clientId) : null;
  const cfg = DOC_TYPES[type];
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(cfg.label)} ${escapeHtml(doc.numero)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Inter',sans-serif;padding:30px;color:#1A1310}
      .invoice{max-width:800px;margin:0 auto}
      .invoice-header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid ${escapeHtml(cfg.color)};margin-bottom:20px}
      .invoice-logo h2{font-family:'Playfair Display',serif;font-size:24px;color:#3E2712;margin:0}
      .invoice-logo p{font-size:11px;color:#6B5B4A;margin:2px 0}
      .invoice-title{text-align:right}
      .invoice-title h3{font-size:28px;margin:0;font-family:'Playfair Display',serif}
      .invoice-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
      .invoice-info .section{background:#FDF8EF;padding:12px;border-radius:8px}
      .invoice-info h5{font-size:11px;text-transform:uppercase;color:#6B5B4A;margin:0 0 6px;letter-spacing:0.5px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:${escapeHtml(cfg.color)};color:#fff;padding:10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
      td{padding:10px;border-bottom:1px solid #E9DCC3}
      .invoice-totals{display:flex;justify-content:flex-end;margin-top:16px}
      .invoice-totals table{width:auto;min-width:320px}
      .invoice-totals td{padding:6px 12px;border:none}
      .total-row td{background:${escapeHtml(cfg.color)};color:#fff;font-weight:700;font-size:16px}
      .invoice-footer{margin-top:30px;padding-top:16px;border-top:1px solid #E9DCC3;text-align:center;font-size:11px;color:#6B5B4A}
      .badge{padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;display:inline-block}
      .badge-success{background:#e8f5e9;color:#2e7d32}
      .badge-danger{background:#ffebee;color:#c62828}
      .badge-neutral{background:#f5f5f5;color:#666}
      @media print{body{padding:0}.invoice{max-width:100%}}
    </style></head><body>${docHTML(doc, type, c, true)}
    <script>window.onload=()=>{setTimeout(()=>window.print(),200);};<\/script>
    </body></html>`);
  w.document.close();
  logAudit('Facturation','print',doc.numero,`Impression ${cfg.label} ${doc.numero}`);
}

// ============ CONVERSION EN FACTURE ============
function convertirEnFacture(id, sourceType){
  const col = sourceType==='proforma'?'proformas':'devis';
  const src = db[col].find(x=>x.id===id);
  if(!src){ toast('Document introuvable','warning'); return; }
  if(src.factureId&&db.factures.some(f=>f.id===src.factureId)){toast('Ce document est déjà converti','warning');return;}
  confirmDialog(`Convertir cette ${DOC_TYPES[sourceType].label.toLowerCase()} en facture ? Une nouvelle facture sera créée à partir des mêmes lignes.`, ()=>{
    const facture = {
      id: uid('fac'),
      numero: `FAC-${new Date().getFullYear()}-${String(db.factures.length+1).padStart(4,'0')}`,
      date: new Date().toISOString().slice(0,10),
      type: src.type,
      clientId: src.clientId,
      clientNom: src.clientNom,
      clientTel: src.clientTel,
      objet: src.objet,
      lignes: JSON.parse(JSON.stringify(src.lignes)),
      ssTotal: src.ssTotal,
      remisePct: src.remisePct,
      remise: src.remise,
      totalHT: src.totalHT,
      tvaPct: src.tvaPct,
      tva: src.tva,
      total: src.total,
      paye: 0,
      statut: 'impaye',
      notes: src.notes,
      // Traçabilité conversion
      sourceType: sourceType,
      sourceId: src.id,
      sourceNumero: src.numero
    };
    db.factures.push(facture);
    src.statut = 'convertie';
    src.factureId = facture.id;
    src.factureNumero = facture.numero;
    saveDB();
    logAudit('Facturation','critical',facture.numero,`Conversion ${DOC_TYPES[sourceType].label} ${src.numero} → Facture ${facture.numero}`);
    saveDB();
    closeModal();
    renderFactures(); renderProformas(); renderDevis();
    toast(`✅ ${DOC_TYPES[sourceType].label} convertie en facture ${facture.numero}`);
    // Basculer sur l'onglet factures
    switchFactTab('factures');
  });
}

// ============ SUPPRESSION ============
function deleteDoc(id, type){
  const col = type==='facture'?'factures':(type==='proforma'?'proformas':'devis');
  const cfg = DOC_TYPES[type];
  confirmDialog(`Supprimer ${cfg.label.toLowerCase()} ?`, ()=>{
    const doc = db[col].find(x=>x.id===id);
    logAudit('Facturation','delete',doc?.numero||id,`Suppression ${cfg.label}`,{before:doc});
    db[col] = db[col].filter(x=>x.id!==id);
    saveDB();
    if(type==='facture') renderFactures();
    else if(type==='proforma') renderProformas();
    else renderDevis();
    toast('Supprimé','warning');
  });
}

// ============================================================
// ============ RAPPORTS SPÉCIFIQUES PAR MODULE ============
// ============================================================

function initDatesRapport(prefixDu, prefixAu){
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const last = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
  const du = document.getElementById(prefixDu);
  const au = document.getElementById(prefixAu);
  if(du && !du.value) du.value = first;
  if(au && !au.value) au.value = last;
}

// ============ RAPPORTS RÉSERVATIONS ============
function switchResaTab(tab){
  document.querySelectorAll('[data-resatab]').forEach(t=>t.classList.toggle('active',t.dataset.resatab===tab));
  document.getElementById('resa-liste').style.display = tab==='liste'?'block':'none';
  document.getElementById('resa-rapports').style.display = tab==='rapports'?'block':'none';
  if(tab==='rapports'){
    initDatesRapport('rapResaDu','rapResaAu');
    renderRapportsResa();
  }
}

function renderRapportsResa(){
  const du = document.getElementById('rapResaDu')?.value||'';
  const au = document.getElementById('rapResaAu')?.value||'';
  const bloc = document.getElementById('rapResaBloc')?.value||'';

  const dansPeriode = r => {
    const d = r.arrivee || r.dateCreation?.slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    return true;
  };
  const dansBloc = r => {
    if(!bloc) return true;
    const ch = db.chambres.find(c=>c.id===r.chambreId);
    return ch && ch.bloc===bloc;
  };

  const all = db.reservations.filter(dansPeriode).filter(dansBloc);
  const actives = all.filter(r=>r.statut!=='annulee');
  const annulees = all.filter(r=>r.statut==='annulee');

  const ca = actives.reduce((s,r)=>s+(r.montant||0),0);
  const nuitees = actives.reduce((s,r)=>s+(r.nuits||0),0);
  const encaisse = actives.reduce((s,r)=>s+(r.paye||0),0);
  const reste = ca - encaisse;
  const chambresDispo = bloc ? db.chambres.filter(c=>c.bloc===bloc).length : db.chambres.length;
  const jours = du && au ? Math.max(1, Math.round((new Date(au)-new Date(du))/86400000)+1) : 30;
  const taux = chambresDispo>0 ? Math.round(nuitees/(chambresDispo*jours)*100) : 0;
  const dms = actives.length ? (nuitees/actives.length).toFixed(1) : 0;
  const adr = nuitees>0 ? Math.round(ca/nuitees) : 0;
  const revpar = chambresDispo>0 ? Math.round(ca/(chambresDispo*jours)) : 0;

  // Set KPIs
  const set = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  set('rrCA', fmt(ca));
  set('rrNb', actives.length);
  set('rrNuitees', nuitees);
  set('rrTaux', taux+'%');
  set('rrDMS', dms+' j');
  set('rrADR', fmt(adr));
  set('rrRevPAR', fmt(revpar));
  set('rrAnnul', annulees.length);
  set('rrFacture', fmt(ca));
  set('rrEncaisse', fmt(encaisse));
  set('rrReste', fmt(reste));
  set('rrTauxRec', (ca>0?Math.round(encaisse/ca*100):0)+'%');

  // Top clients
  const parClient = {};
  actives.forEach(r=>{
    const cl = db.clients.find(c=>c.id===r.clientId);
    const nom = cl ? cl.prenom+' '+cl.nom : '—';
    if(!parClient[nom]) parClient[nom] = {sejours:0, nuitees:0, ca:0};
    parClient[nom].sejours++;
    parClient[nom].nuitees += r.nuits||0;
    parClient[nom].ca += r.montant||0;
  });
  const topCl = Object.entries(parClient).sort((a,b)=>b[1].ca-a[1].ca).slice(0,10);
  document.getElementById('rrTopClients').innerHTML = topCl.length ? topCl.map(([n,v],i)=>`
    <tr><td><strong>#${escapeHtml(i+1)}</strong></td><td>${escapeHtml(n)}</td><td>${escapeHtml(v.sejours)}</td><td>${escapeHtml(v.nuitees)}</td><td style="font-weight:700">${escapeHtml(fmt(v.ca))}</td></tr>
  `).join('') : '<tr><td colspan="5" class="empty">—</td></tr>';

  // Par bloc
  const parBloc = {};
  actives.forEach(r=>{
    const ch = db.chambres.find(c=>c.id===r.chambreId);
    const b = ch ? ch.bloc : '—';
    if(!parBloc[b]) parBloc[b] = {resa:0, nuitees:0, ca:0};
    parBloc[b].resa++;
    parBloc[b].nuitees += r.nuits||0;
    parBloc[b].ca += r.montant||0;
  });
  document.getElementById('rrParBloc').innerHTML = Object.entries(parBloc).length ? Object.entries(parBloc).sort((a,b)=>b[1].ca-a[1].ca).map(([b,v])=>{
    const nbCh = db.chambres.filter(c=>c.bloc===b).length;
    const occ = nbCh>0 ? Math.round(v.nuitees/(nbCh*jours)*100) : 0;
    return `<tr><td>${escapeHtml(b.split('—')[0]||b)}</td><td>${escapeHtml(v.resa)}</td><td>${escapeHtml(v.nuitees)}</td><td style="font-weight:700">${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml(occ)}%</td></tr>`;
  }).join('') : '<tr><td colspan="5" class="empty">—</td></tr>';

  // Par chambre (top 10)
  const parCh = {};
  actives.forEach(r=>{
    const ch = db.chambres.find(c=>c.id===r.chambreId);
    const n = ch ? ch.numero : '—';
    if(!parCh[n]) parCh[n] = {nuitees:0, ca:0};
    parCh[n].nuitees += r.nuits||0;
    parCh[n].ca += r.montant||0;
  });
  const topCh = Object.entries(parCh).sort((a,b)=>b[1].ca-a[1].ca).slice(0,10);
  document.getElementById('rrParChambre').innerHTML = topCh.length ? topCh.map(([n,v])=>{
    const occ = jours>0 ? Math.round(v.nuitees/jours*100) : 0;
    return `<tr><td><strong>${escapeHtml(n)}</strong></td><td>${escapeHtml(v.nuitees)}</td><td style="font-weight:700">${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml(occ)}%</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="empty">—</td></tr>';

  // Par statut
  const parStat = {};
  all.forEach(r=>{
    if(!parStat[r.statut]) parStat[r.statut] = {nb:0, ca:0};
    parStat[r.statut].nb++;
    parStat[r.statut].ca += r.montant||0;
  });
  const tot = all.length || 1;
  document.getElementById('rrParStatut').innerHTML = Object.entries(parStat).map(([s,v])=>`
    <tr><td>${escapeHtml(s)}</td><td>${escapeHtml(v.nb)}</td><td>${escapeHtml((v.nb/tot*100).toFixed(1))}%</td><td>${escapeHtml(fmt(v.ca))}</td></tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Par mois
  const parMois = {};
  actives.forEach(r=>{
    const m = (r.arrivee||'').slice(0,7);
    if(!m) return;
    if(!parMois[m]) parMois[m] = {resa:0, nuitees:0, ca:0};
    parMois[m].resa++;
    parMois[m].nuitees += r.nuits||0;
    parMois[m].ca += r.montant||0;
  });
  document.getElementById('rrParMois').innerHTML = Object.entries(parMois).sort().map(([m,v])=>`
    <tr><td><strong>${escapeHtml(m)}</strong></td><td>${escapeHtml(v.resa)}</td><td>${escapeHtml(v.nuitees)}</td><td style="font-weight:700">${escapeHtml(fmt(v.ca))}</td></tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';
}

function exportRapportResa(){
  const du = document.getElementById('rapResaDu').value;
  const au = document.getElementById('rapResaAu').value;
  const bloc = document.getElementById('rapResaBloc').value;
  const actives = db.reservations.filter(r=>{
    const d = r.arrivee || (r.dateCreation||'').slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    if(bloc){
      const ch = db.chambres.find(c=>c.id===r.chambreId);
      if(!ch || ch.bloc!==bloc) return false;
    }
    return true;
  });
  let csv = 'Ref;Client;Chambre;Bloc;Arrivee;Depart;Nuits;Montant;Paye;Reste;Statut\n';
  actives.forEach(r=>{
    const cl = db.clients.find(c=>c.id===r.clientId);
    const ch = db.chambres.find(c=>c.id===r.chambreId);
    csv += `${r.ref};"${cl?cl.prenom+' '+cl.nom:''}";${ch?ch.numero:''};"${ch?ch.bloc:''}";${r.arrivee};${r.depart};${r.nuits};${r.montant};${r.paye};${(r.montant||0)-(r.paye||0)};${r.statut}\n`;
  });
  downloadFile(`rapport_reservations_${du}_${au}.csv`, csv);
  logAudit('Réservations','export','','Export CSV rapport réservations');
}

function imprimerRapportResa(){
  const c = db.config;
  const du = document.getElementById('rapResaDu').value;
  const au = document.getElementById('rapResaAu').value;
  const w = window.open('','_blank','width=1000,height=800');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Réservations</title>
    <style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#333;font-size:12px}
      h1{color:#5C3A1E;margin:0}
      .head{border-bottom:3px solid #D4A017;padding-bottom:10px;margin-bottom:15px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left}
      th{background:#5C3A1E;color:#fff;font-size:11px}
      .kpi{display:inline-block;padding:8px 12px;background:#FDF8EF;border-radius:6px;margin:4px}
      @media print{body{padding:0}}
    </style></head><body>
    <div class="head">
      <h1>${escapeHtml(c.raison||c.nom)}</h1>
      <div style="font-size:11px">${escapeHtml(c.adresse)} • ${escapeHtml(c.tel)}</div>
      <h2 style="color:#D4A017;margin-top:10px">RAPPORT DES RÉSERVATIONS</h2>
      <div>Période : ${escapeHtml(du || '—')} au ${escapeHtml(au || '—')}</div>
    </div>
    ${printableReport('resa-rapports')}
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
  logAudit('Réservations','print','','Impression rapport réservations');
}

// ============ MOUVEMENTS STOCK + RAPPORTS STOCK ============
function switchStkTab(tab){
  document.querySelectorAll('[data-stktab]').forEach(t=>t.classList.toggle('active',t.dataset.stktab===tab));
  document.getElementById('stk-inventaire').style.display = tab==='inventaire'?'block':'none';
  document.getElementById('stk-mouvements').style.display = tab==='mouvements'?'block':'none';
  document.getElementById('stk-rapports').style.display = tab==='rapports'?'block':'none';
  if(tab==='inventaire') renderStock();
  if(tab==='mouvements'){ initMouvementsStock(); renderMouvementsStock(); }
  if(tab==='rapports'){ initDatesRapport('rapStkDu','rapStkAu'); renderRapportsStock(); }
}

function initMouvementsStock(){
  const sel = document.getElementById('mvArtF');
  if(sel && sel.options.length<=1){
    db.stock.forEach(s=>{
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.designation;
      sel.appendChild(o);
    });
  }
}

function renderMouvementsStock(){
  const artF = document.getElementById('mvArtF')?.value||'';
  const typeF = document.getElementById('mvTypeF')?.value||'';
  const du = document.getElementById('mvDuF')?.value||'';
  const au = document.getElementById('mvAuF')?.value||'';
  let list = (db.mouvementsStock||[]).filter(m=>{
    if(artF && m.articleId!==artF) return false;
    if(typeF && m.type!==typeF) return false;
    if(du && m.date<du) return false;
    if(au && m.date>au) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const totEnt = list.filter(m=>m.type==='entree').reduce((s,m)=>{
    const a = db.stock.find(x=>x.id===m.articleId); return s + m.quantite*(a?a.prixUnitaire:0);
  }, 0);
  const totSor = list.filter(m=>m.type==='sortie').reduce((s,m)=>{
    const a = db.stock.find(x=>x.id===m.articleId); return s + m.quantite*(a?a.prixUnitaire:0);
  }, 0);

  document.getElementById('mouvementsStockTable').innerHTML = list.length ? list.map(m=>{
    const a = db.stock.find(x=>x.id===m.articleId);
    const val = m.quantite * (a?a.prixUnitaire:0);
    return `<tr>
      <td>${escapeHtml(fmtDate(m.date))}</td>
      <td><strong>${escapeHtml(a?a.designation:'—')}</strong></td>
      <td>${m.type==='entree'?'<span class="badge badge-success">↑ Entrée</span>':'<span class="badge badge-danger">↓ Sortie</span>'}</td>
      <td style="font-weight:700;color:${escapeHtml(m.type==='entree'?'var(--success)':'var(--danger)')}">${escapeHtml(m.type==='entree'?'+':'-')}${escapeHtml(m.quantite)} ${escapeHtml(a?a.unite:'')}</td>
      <td style="font-size:12px">${escapeHtml(m.motif||'—')}</td>
      <td>${escapeHtml(fmt(val))}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty">Aucun mouvement</td></tr>';

  document.getElementById('mouvementsStockTotaux').innerHTML = `<tr style="background:var(--gold-soft);font-weight:700">
    <td colspan="5" style="text-align:right">Total entrées : <span style="color:var(--success)">${escapeHtml(fmt(totEnt))}</span> • Total sorties : <span style="color:var(--danger)">${escapeHtml(fmt(totSor))}</span></td>
    <td>Net : ${escapeHtml(fmt(totEnt-totSor))}</td>
  </tr>`;
}

function renderRapportsStock(){
  const du = document.getElementById('rapStkDu')?.value||'';
  const au = document.getElementById('rapStkAu')?.value||'';

  const mvts = (db.mouvementsStock||[]).filter(m=>{
    if(du && m.date<du) return false;
    if(au && m.date>au) return false;
    return true;
  });
  const entrees = mvts.filter(m=>m.type==='entree');
  const sorties = mvts.filter(m=>m.type==='sortie');
  const qtyEnt = entrees.reduce((s,m)=>s+m.quantite,0);
  const qtySor = sorties.reduce((s,m)=>s+m.quantite,0);
  const valEnt = entrees.reduce((s,m)=>{ const a=db.stock.find(x=>x.id===m.articleId); return s+m.quantite*(a?a.prixUnitaire:0);}, 0);
  const valSor = sorties.reduce((s,m)=>{ const a=db.stock.find(x=>x.id===m.articleId); return s+m.quantite*(a?a.prixUnitaire:0);}, 0);
  const valTot = db.stock.reduce((s,a)=>s+a.quantite*a.prixUnitaire, 0);
  const alertes = stockAlerts();

  const set = (id,v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  set('rsValeur', fmt(valTot));
  set('rsNbArt', db.stock.length);
  set('rsEntrees', qtyEnt);
  set('rsSorties', qtySor);
  set('rsCoutConso', fmt(valSor));
  set('rsAlertes', alertes.faibles.length + alertes.perimes.length);

  // Top consommations (sorties)
  const parArtSor = {};
  sorties.forEach(m=>{
    if(!parArtSor[m.articleId]) parArtSor[m.articleId] = {qte:0, val:0};
    const a = db.stock.find(x=>x.id===m.articleId);
    parArtSor[m.articleId].qte += m.quantite;
    parArtSor[m.articleId].val += m.quantite*(a?a.prixUnitaire:0);
  });
  const topSor = Object.entries(parArtSor).sort((a,b)=>b[1].val-a[1].val).slice(0,10);
  document.getElementById('rsTopConso').innerHTML = topSor.length ? topSor.map(([id,v],i)=>{
    const a = db.stock.find(x=>x.id===id);
    return `<tr><td><strong>#${escapeHtml(i+1)}</strong></td><td>${escapeHtml(a?a.designation:'—')}</td><td>${escapeHtml(v.qte)} ${escapeHtml(a?a.unite:'')}</td><td style="font-weight:700;color:var(--danger)">${escapeHtml(fmt(v.val))}</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="empty">—</td></tr>';

  // Top entrées
  const parArtEnt = {};
  entrees.forEach(m=>{
    if(!parArtEnt[m.articleId]) parArtEnt[m.articleId] = {qte:0, val:0};
    const a = db.stock.find(x=>x.id===m.articleId);
    parArtEnt[m.articleId].qte += m.quantite;
    parArtEnt[m.articleId].val += m.quantite*(a?a.prixUnitaire:0);
  });
  const topEnt = Object.entries(parArtEnt).sort((a,b)=>b[1].val-a[1].val).slice(0,10);
  document.getElementById('rsTopEntrees').innerHTML = topEnt.length ? topEnt.map(([id,v],i)=>{
    const a = db.stock.find(x=>x.id===id);
    return `<tr><td><strong>#${escapeHtml(i+1)}</strong></td><td>${escapeHtml(a?a.designation:'—')}</td><td>${escapeHtml(v.qte)} ${escapeHtml(a?a.unite:'')}</td><td style="font-weight:700;color:var(--success)">${escapeHtml(fmt(v.val))}</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="empty">—</td></tr>';

  // Par catégorie
  const parCat = {};
  db.stock.forEach(a=>{
    if(!parCat[a.categorie]) parCat[a.categorie] = {nb:0, val:0};
    parCat[a.categorie].nb++;
    parCat[a.categorie].val += a.quantite*a.prixUnitaire;
  });
  const totCat = valTot || 1;
  document.getElementById('rsParCat').innerHTML = Object.entries(parCat).sort((a,b)=>b[1].val-a[1].val).map(([c,v])=>`
    <tr><td><strong>${escapeHtml(c)}</strong></td><td>${escapeHtml(v.nb)}</td><td>${escapeHtml(fmt(v.val))}</td><td>${escapeHtml((v.val/totCat*100).toFixed(1))}%</td></tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Alertes
  const alertRows = [];
  alertes.faibles.forEach(a=>alertRows.push({nom:a.designation, type:'Stock faible', info:a.quantite+'/'+a.seuilAlerte+' '+a.unite}));
  alertes.perimes.forEach(a=>alertRows.push({nom:a.designation, type:'Péremption', info:fmtDate(a.datePeremption)}));
  document.getElementById('rsAlertesList').innerHTML = alertRows.length ? alertRows.map(a=>`
    <tr><td>${escapeHtml(a.nom)}</td><td><span class="badge badge-danger">${escapeHtml(a.type)}</span></td><td>${escapeHtml(a.info)}</td></tr>
  `).join('') : '<tr><td colspan="3" class="empty">✓ Aucune alerte</td></tr>';

  // Articles dormants (sans mouvement dans la période)
  const idsAvecMvt = new Set(mvts.map(m=>m.articleId));
  const dormants = db.stock.filter(a=>!idsAvecMvt.has(a.id) && a.quantite>0);
  document.getElementById('rsDormants').innerHTML = dormants.length ? dormants.map(a=>{
    const dernier = (db.mouvementsStock||[]).filter(m=>m.articleId===a.id).sort((x,y)=>new Date(y.date)-new Date(x.date))[0];
    return `<tr><td><strong>${escapeHtml(a.designation)}</strong></td><td>${escapeHtml(a.categorie)}</td><td>${escapeHtml(a.quantite)} ${escapeHtml(a.unite)}</td><td>${escapeHtml(fmt(a.quantite*a.prixUnitaire))}</td><td>${escapeHtml(dernier?fmtDate(dernier.date):'Jamais')}</td></tr>`;
  }).join('') : '<tr><td colspan="5" class="empty">✓ Tous les articles ont bougé sur la période</td></tr>';
}

function exportRapportStock(){
  const du = document.getElementById('rapStkDu').value;
  const au = document.getElementById('rapStkAu').value;
  let csv = 'Désignation;Catégorie;Unité;Quantité;Seuil;PU;Valeur;Péremption\n';
  db.stock.forEach(a=>{
    csv += `"${a.designation}";${a.categorie};${a.unite};${a.quantite};${a.seuilAlerte};${a.prixUnitaire};${a.quantite*a.prixUnitaire};${a.datePeremption||''}\n`;
  });
  csv += '\nMOUVEMENTS DE LA PÉRIODE\nDate;Article;Type;Quantité;Motif;Valeur\n';
  (db.mouvementsStock||[]).filter(m=>(!du||m.date>=du)&&(!au||m.date<=au)).forEach(m=>{
    const a = db.stock.find(x=>x.id===m.articleId);
    csv += `${m.date};"${a?a.designation:''}";${m.type};${m.quantite};"${m.motif||''}";${m.quantite*(a?a.prixUnitaire:0)}\n`;
  });
  downloadFile(`rapport_stock_${du}_${au}.csv`, csv);
  logAudit('Stock','export','','Export CSV rapport stock');
}

function imprimerRapportStock(){
  const c = db.config;
  const du = document.getElementById('rapStkDu').value;
  const au = document.getElementById('rapStkAu').value;
  const w = window.open('','_blank','width=1000,height=800');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Stock</title>
    <style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#333;font-size:12px}
      h1{color:#5C3A1E;margin:0}
      .head{border-bottom:3px solid #D4A017;padding-bottom:10px;margin-bottom:15px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left}
      th{background:#5C3A1E;color:#fff;font-size:11px}
    </style></head><body>
    <div class="head">
      <h1>${escapeHtml(c.raison||c.nom)}</h1>
      <div>${escapeHtml(c.adresse)} • ${escapeHtml(c.tel)}</div>
      <h2 style="color:#D4A017;margin-top:10px">RAPPORT STOCK & APPROVISIONNEMENT</h2>
      <div>Période : ${escapeHtml(du||'—')} au ${escapeHtml(au||'—')}</div>
    </div>
    ${printableReport('stk-rapports')}
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
  logAudit('Stock','print','','Impression rapport stock');
}

// ============ RAPPORTS RESTAURANT (approfondis) ============
function renderRapportsResto(){
  initDatesRapport('rapRestoDu','rapRestoAu');
  const du = document.getElementById('rapRestoDu')?.value||'';
  const au = document.getElementById('rapRestoAu')?.value||'';

  const cmds = db.commandes.filter(c=>{
    if(c.statut==='annulee') return false;
    const d = (c.date||'').slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    return true;
  });
  const annulees = db.commandes.filter(c=>{
    if(c.statut!=='annulee') return false;
    const d = (c.date||'').slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    return true;
  });

  const ca = cmds.reduce((s,c)=>s+(c.total||0),0);
  const couverts = cmds.reduce((s,c)=>s+(c.couverts||1),0);
  const jours = du && au ? Math.max(1, Math.round((new Date(au)-new Date(du))/86400000)+1) : 30;
  const pour = cmds.reduce((s,c)=>s+(c.pourboire||0),0);
  const rem = cmds.reduce((s,c)=>s+(c.remise||0),0);

  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent = v; };
  set('rrsCA', fmt(ca));
  set('rrsNbCmd', cmds.length);
  set('rrsTicket', cmds.length?fmt(Math.round(ca/cmds.length)):'0');
  set('rrsCouverts', couverts);
  set('rrsAnnul', annulees.length);
  set('rrsCAJ', fmt(Math.round(ca/jours)));
  set('rrsPour', fmt(pour));
  set('rrsRem', fmt(rem));

  // Par catégorie
  const parCat = {};
  cmds.forEach(c=>(c.lignes||[]).forEach(l=>{
    const cat = l.categorie || 'Autre';
    if(!parCat[cat]) parCat[cat] = {qte:0, ca:0};
    parCat[cat].qte += l.qte;
    parCat[cat].ca += l.qte*l.pu;
  }));
  const totCatCA = Object.values(parCat).reduce((s,v)=>s+v.ca,0) || 1;
  document.getElementById('rrsParCat').innerHTML = Object.entries(parCat).sort((a,b)=>b[1].ca-a[1].ca).map(([c,v])=>`
    <tr><td><strong>${escapeHtml(c)}</strong></td><td>${escapeHtml(v.qte)}</td><td>${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml((v.ca/totCatCA*100).toFixed(1))}%</td></tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Envoi cuisine vs bar
  const envoi = {cuisine:{nb:0,ca:0}, bar:{nb:0,ca:0}};
  cmds.forEach(c=>(c.lignes||[]).forEach(l=>{
    const e = l.envoi==='bar'?'bar':'cuisine';
    envoi[e].nb += l.qte;
    envoi[e].ca += l.qte*l.pu;
  }));
  const totEnvCA = envoi.cuisine.ca + envoi.bar.ca || 1;
  document.getElementById('rrsEnvoi').innerHTML = `
    <tr><td>👨‍🍳 Cuisine</td><td>${escapeHtml(envoi.cuisine.nb)}</td><td style="font-weight:700">${escapeHtml(fmt(envoi.cuisine.ca))}</td><td>${escapeHtml((envoi.cuisine.ca/totEnvCA*100).toFixed(1))}%</td></tr>
    <tr><td>🍹 Bar</td><td>${escapeHtml(envoi.bar.nb)}</td><td style="font-weight:700">${escapeHtml(fmt(envoi.bar.ca))}</td><td>${escapeHtml((envoi.bar.ca/totEnvCA*100).toFixed(1))}%</td></tr>
  `;

  // Modes paiement
  const modes = {espece:0,mobile:0,virement:0,carte:0};
  const modesNb = {espece:0,mobile:0,virement:0,carte:0};
  cmds.forEach(c=>{
    if(c.paiements){
      c.paiements.forEach(p=>{
        const mt = Math.min(p.montant, c.total);
        if(modes[p.mode]!==undefined){ modes[p.mode]+=mt; modesNb[p.mode]++; }
      });
    }
  });
  const totMode = Object.values(modes).reduce((s,v)=>s+v,0) || 1;
  document.getElementById('rrsModes').innerHTML = Object.entries(modes).map(([m,v])=>`
    <tr><td>${escapeHtml(modeLabel(m))}</td><td>${escapeHtml(modesNb[m])}</td><td style="font-weight:700">${escapeHtml(fmt(v))}</td><td>${escapeHtml((v/totMode*100).toFixed(1))}%</td></tr>
  `).join('');

  // Tables
  const parTbl = {};
  cmds.filter(c=>c.table).forEach(c=>{
    if(!parTbl[c.table]) parTbl[c.table] = {nb:0, ca:0};
    parTbl[c.table].nb++;
    parTbl[c.table].ca += c.total||0;
  });
  document.getElementById('rrsTables').innerHTML = Object.entries(parTbl).sort((a,b)=>b[1].ca-a[1].ca).slice(0,15).map(([t,v])=>`
    <tr><td><strong>${escapeHtml(t)}</strong></td><td>${escapeHtml(v.nb)}</td><td>${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml(fmt(Math.round(v.ca/v.nb)))}</td></tr>
  `).join('') || '<tr><td colspan="4" class="empty">—</td></tr>';

  // Jours de la semaine
  const jrs = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const parJr = {};
  jrs.forEach(j=>parJr[j] = {nb:0, ca:0});
  cmds.forEach(c=>{
    const d = new Date(c.date);
    const j = jrs[d.getDay()];
    parJr[j].nb++;
    parJr[j].ca += c.total||0;
  });
  document.getElementById('rrsJours').innerHTML = jrs.map(j=>{
    const v = parJr[j];
    return `<tr><td><strong>${escapeHtml(j)}</strong></td><td>${escapeHtml(v.nb)}</td><td>${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml(v.nb?fmt(Math.round(v.ca/v.nb)):'0')}</td></tr>`;
  }).join('');

  // Marges par plat (top 15)
  const parPlat = {};
  cmds.forEach(c=>(c.lignes||[]).forEach(l=>{
    if(!parPlat[l.nom]) parPlat[l.nom] = {qte:0, ca:0, cout:0};
    const menu = db.menu.find(m=>m.id===l.menuId);
    parPlat[l.nom].qte += l.qte;
    parPlat[l.nom].ca += l.qte*l.pu;
    parPlat[l.nom].cout += l.qte*((menu&&menu.cout)||0);
  }));
  const platsList = Object.entries(parPlat).sort((a,b)=>b[1].ca-a[1].ca).slice(0,15);
  document.getElementById('rrsMarges').innerHTML = platsList.length ? platsList.map(([n,v])=>{
    const marge = v.ca - v.cout;
    const pct = v.ca>0 ? Math.round(marge/v.ca*100) : 0;
    return `<tr><td>${escapeHtml(n)}</td><td>${escapeHtml(v.qte)}</td><td>${escapeHtml(fmt(v.ca))}</td><td>${escapeHtml(fmt(v.cout))}</td><td style="font-weight:700;color:${escapeHtml(pct>50?'var(--success)':'var(--gold-dark)')}">${escapeHtml(fmt(marge))} (${escapeHtml(pct)}%)</td></tr>`;
  }).join('') : '<tr><td colspan="5" class="empty">—</td></tr>';
}

function exportRapportResto(){
  const du = document.getElementById('rapRestoDu').value;
  const au = document.getElementById('rapRestoAu').value;
  const cmds = db.commandes.filter(c=>{
    const d = (c.date||'').slice(0,10);
    if(du && d<du) return false;
    if(au && d>au) return false;
    return true;
  });
  let csv = 'Numero;Date;Type;Table;Client;Serveur;Couverts;Articles;SsTotal;Remise;Pourboire;Total;Statut\n';
  cmds.forEach(c=>{
    csv += `${c.numero};${c.date};${c.typeService||''};${c.table||''};"${c.clientNom||''}";"${c.serveur||''}";${c.couverts||1};${(c.lignes||[]).length};${c.ssTotal||c.total};${c.remise||0};${c.pourboire||0};${c.total};${c.statut}\n`;
  });
  downloadFile(`rapport_restaurant_${du}_${au}.csv`, csv);
  logAudit('Restauration','export','','Export CSV rapport restaurant');
}

function imprimerRapportResto(){
  const c = db.config;
  const du = document.getElementById('rapRestoDu').value;
  const au = document.getElementById('rapRestoAu').value;
  const w = window.open('','_blank','width=1000,height=800');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Restaurant</title>
    <style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#333;font-size:12px}
      h1{color:#5C3A1E;margin:0}
      .head{border-bottom:3px solid #D4A017;padding-bottom:10px;margin-bottom:15px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left}
      th{background:#5C3A1E;color:#fff;font-size:11px}
    </style></head><body>
    <div class="head">
      <h1>${escapeHtml(c.raison||c.nom)}</h1>
      <div>${escapeHtml(c.adresse)} • ${escapeHtml(c.tel)}</div>
      <h2 style="color:#D4A017;margin-top:10px">RAPPORT DÉTAILLÉ RESTAURANT</h2>
      <div>Période : ${escapeHtml(du||'—')} au ${escapeHtml(au||'—')}</div>
    </div>
    ${printableReport('resto-rapports')}
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
  logAudit('Restauration','print','','Impression rapport restaurant');
}

// ============================================================
// ============ AUDIT & TRAÇABILITÉ ============
// ============================================================

/**
 * Enregistre une action dans le journal d'audit.
 * @param {string} module - Nom du module (Caisse, Facturation, etc.)
 * @param {string} action - Type: create|update|delete|login|logout|view|export|print|critical
 * @param {string} entity - Entité concernée (ex: "Facture FAC-2001")
 * @param {string} description - Description humaine de l'action
 * @param {object} details - Données additionnelles (before/after, montant, etc.)
 */
function logAudit(module, action, entity, description, details){
  if(!db.auditLog) db.auditLog = [];
  const u = db.currentUser;
  const entry = {
    id: uid('au'),
    timestamp: new Date().toISOString(),
    userId: u?u.id:'anonyme',
    userLogin: u?u.login:'anonyme',
    userName: u?u.nom:'Anonyme',
    userRole: u?u.role:'—',
    module: module || 'Système',
    action: action || 'view',
    entity: entity || '',
    description: description || '',
    details: details || null,
    // Empreinte session pour traçabilité multi-postes
    sessionFingerprint: getSessionFingerprint(),
    userAgent: navigator.userAgent.slice(0,150)
  };
  db.auditLog.push(entry);
  // Limite anti-explosion : garder les 5000 dernières entrées
  if(db.auditLog.length > 5000){
    db.auditLog = db.auditLog.slice(-5000);
  }
  // Ne PAS appeler saveDB ici (risque de récursion) - le save se fait via l'appelant
}

function getSessionFingerprint(){
  if(!window._auditFingerprint){
    window._auditFingerprint = Math.random().toString(36).slice(2,10).toUpperCase();
  }
  return window._auditFingerprint;
}

function auditActionBadge(a){
  const map = {
    create:{lib:'Création',color:'var(--success)',bg:'#e8f5e9'},
    update:{lib:'Modification',color:'#c17d00',bg:'#fff8e1'},
    delete:{lib:'Suppression',color:'var(--danger)',bg:'#ffebee'},
    login:{lib:'Connexion',color:'var(--info)',bg:'#e3f2fd'},
    logout:{lib:'Déconnexion',color:'var(--muted)',bg:'#f5f5f5'},
    view:{lib:'Consultation',color:'var(--muted)',bg:'#f5f5f5'},
    export:{lib:'Export',color:'var(--info)',bg:'#e3f2fd'},
    print:{lib:'Impression',color:'var(--info)',bg:'#e3f2fd'},
    critical:{lib:'Critique',color:'#fff',bg:'var(--danger)'}
  };
  const c = map[a] || {lib:a,color:'var(--muted)',bg:'#f5f5f5'};
  return `<span style="padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;color:${escapeHtml(c.color)};background:${escapeHtml(c.bg)}">${escapeHtml(c.lib)}</span>`;
}

let _auditPage = 0;
const AUDIT_PAGE_SIZE = 50;

function renderAudit(){
  // Peupler filtre utilisateurs
  const userSel = document.getElementById('audUser');
  if(userSel && userSel.options.length <= 1){
    const uniqUsers = [...new Set(db.auditLog.map(e=>e.userLogin))];
    uniqUsers.forEach(u=>{
      const opt = document.createElement('option');
      opt.value = u; opt.textContent = u;
      userSel.appendChild(opt);
    });
  }
  const q = (document.getElementById('audSearch')?.value||'').toLowerCase();
  const usr = document.getElementById('audUser')?.value||'';
  const mod = document.getElementById('audModule')?.value||'';
  const act = document.getElementById('audAction')?.value||'';
  const du = document.getElementById('audDu')?.value||'';
  const au = document.getElementById('audAu')?.value||'';

  let list = [...(db.auditLog||[])].filter(e=>{
    if(usr && e.userLogin!==usr) return false;
    if(mod && e.module!==mod) return false;
    if(act && e.action!==act) return false;
    if(du && e.timestamp.slice(0,10)<du) return false;
    if(au && e.timestamp.slice(0,10)>au) return false;
    if(q){
      const hay = (e.userLogin+' '+e.userName+' '+e.entity+' '+e.description+' '+e.module).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));

  // KPIs (basés sur log complet, pas filtré)
  const today = new Date().toISOString().slice(0,10);
  const weekAgo = new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const all = db.auditLog||[];
  document.getElementById('audToday').textContent = all.filter(e=>e.timestamp.slice(0,10)===today).length;
  document.getElementById('audWeek').textContent = all.filter(e=>e.timestamp.slice(0,10)>=weekAgo).length;
  document.getElementById('audTotal').textContent = all.length;
  // Top user (7 derniers jours)
  const parUser = {};
  all.filter(e=>e.timestamp.slice(0,10)>=weekAgo).forEach(e=>{
    parUser[e.userName] = (parUser[e.userName]||0)+1;
  });
  const top = Object.entries(parUser).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('audTopUser').textContent = top ? top[0]+' ('+top[1]+')' : '—';

  // Pagination
  const total = list.length;
  const pages = Math.ceil(total/AUDIT_PAGE_SIZE);
  if(_auditPage >= pages) _auditPage = 0;
  const slice = list.slice(_auditPage*AUDIT_PAGE_SIZE, (_auditPage+1)*AUDIT_PAGE_SIZE);

  document.getElementById('audCount').textContent = ` (${total} événement${total>1?'s':''})`;
  document.getElementById('auditTable').innerHTML = slice.length ? slice.map(e=>`
    <tr>
      <td style="white-space:nowrap;font-size:12px">
        <div>${escapeHtml(fmtDateTime(e.timestamp))}</div>
        <div style="color:var(--muted);font-size:10px">${escapeHtml(new Date(e.timestamp).toLocaleTimeString('fr-FR'))}</div>
      </td>
      <td>
        <div style="font-weight:600">${escapeHtml(e.userName)}</div>
        <div style="color:var(--muted);font-size:11px">${escapeHtml(e.userLogin)} • ${escapeHtml(e.userRole||'')}</div>
      </td>
      <td><span class="badge badge-neutral">${escapeHtml(e.module)}</span></td>
      <td>${auditActionBadge(e.action)}</td>
      <td style="font-family:monospace;font-size:12px">${escapeHtml(e.entity||'—')}</td>
      <td style="font-size:13px">${escapeHtml(e.description||'—')}</td>
      <td>
        ${e.details ? `<button class="btn btn-sm btn-ghost" onclick='voirDetailAudit("${escapeHtml(e.id)}")' title="Voir détail">🔎</button>` : ''}
      </td>
    </tr>
  `).join('') : '<tr><td colspan="7" class="empty">Aucun événement</td></tr>';

  // Pagination controls
  if(pages > 1){
    let html = '';
    if(_auditPage > 0) html += `<button class="btn btn-sm btn-ghost" onclick="_auditPage--;renderAudit()">← Précédent</button> `;
    html += `Page <strong>${escapeHtml(_auditPage+1)}</strong> / ${escapeHtml(pages)}`;
    if(_auditPage < pages-1) html += ` <button class="btn btn-sm btn-ghost" onclick="_auditPage++;renderAudit()">Suivant →</button>`;
    document.getElementById('audPagination').innerHTML = html;
  } else {
    document.getElementById('audPagination').innerHTML = '';
  }
}

function voirDetailAudit(id){
  const e = db.auditLog.find(x=>x.id===id);
  if(!e) return;
  let detailsHtml = '';
  if(e.details){
    if(e.details.before || e.details.after){
      detailsHtml = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <h4 style="color:var(--danger)">AVANT</h4>
            <pre style="background:#ffebee;padding:10px;border-radius:6px;font-size:11px;max-height:300px;overflow:auto">${escapeHtml(JSON.stringify(e.details.before,null,2))}</pre>
          </div>
          <div>
            <h4 style="color:var(--success)">APRÈS</h4>
            <pre style="background:#e8f5e9;padding:10px;border-radius:6px;font-size:11px;max-height:300px;overflow:auto">${escapeHtml(JSON.stringify(e.details.after,null,2))}</pre>
          </div>
        </div>`;
    } else {
      detailsHtml = `<pre style="background:#fdf8ef;padding:10px;border-radius:6px;font-size:11px;max-height:400px;overflow:auto">${escapeHtml(JSON.stringify(e.details,null,2))}</pre>`;
    }
  }
  openModal('🔎 Détail de l\'événement',`
    <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;background:var(--gold-soft);padding:14px;border-radius:8px;margin-bottom:14px">
      <div style="color:var(--muted);font-size:11px">HORODATAGE</div><div><strong>${escapeHtml(new Date(e.timestamp).toLocaleString('fr-FR'))}</strong></div>
      <div style="color:var(--muted);font-size:11px">UTILISATEUR</div><div><strong>${escapeHtml(e.userName)}</strong> (${escapeHtml(e.userLogin)}) — ${escapeHtml(e.userRole||'—')}</div>
      <div style="color:var(--muted);font-size:11px">MODULE</div><div>${escapeHtml(e.module)}</div>
      <div style="color:var(--muted);font-size:11px">ACTION</div><div>${auditActionBadge(e.action)}</div>
      <div style="color:var(--muted);font-size:11px">ENTITÉ</div><div style="font-family:monospace">${escapeHtml(e.entity||'—')}</div>
      <div style="color:var(--muted);font-size:11px">DESCRIPTION</div><div>${escapeHtml(e.description||'—')}</div>
      <div style="color:var(--muted);font-size:11px">SESSION</div><div style="font-family:monospace;font-size:11px">${escapeHtml(e.sessionFingerprint||'—')}</div>
      <div style="color:var(--muted);font-size:11px">NAVIGATEUR</div><div style="font-size:11px;color:var(--muted)">${escapeHtml((e.userAgent||'').slice(0,120))}</div>
    </div>
    ${detailsHtml}
  `,`<button class="btn btn-primary" onclick="closeModal()">Fermer</button>`);
}

function exportAudit(){
  logAudit('Audit','export','','Export CSV du journal d\'audit');
  saveDB();
  let csv = 'Horodatage;Utilisateur;Login;Role;Module;Action;Entite;Description;Session\n';
  db.auditLog.forEach(e=>{
    const clean = s => ('"'+String(s||'').replace(/"/g,'""')+'"');
    csv += [
      e.timestamp,
      clean(e.userName), clean(e.userLogin), clean(e.userRole),
      clean(e.module), clean(e.action),
      clean(e.entity), clean(e.description),
      clean(e.sessionFingerprint)
    ].join(';') + '\n';
  });
  downloadFile('audit_'+new Date().toISOString().slice(0,10)+'.csv', csv);
}

function purgerAudit(){
  openModal('🗑 Purger les anciens événements',`
    <div class="form-group">
      <label>Supprimer les événements antérieurs à :</label>
      <input type="date" class="form-control" id="purgDate" value="${escapeHtml(new Date(Date.now()-90*86400000).toISOString().slice(0,10))}">
    </div>
    <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:10px;border-radius:6px;font-size:13px">
      ⚠ Cette action est irréversible. Les événements critiques (connexions échouées, actions financières importantes) sont préservés.
    </div>
  `,`<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-danger" onclick="confirmerPurgeAudit()">🗑 Purger</button>`);
}
function confirmerPurgeAudit(){
  const seuil = document.getElementById('purgDate').value;
  const avant = db.auditLog.length;
  // Préserver les actions critiques et les connexions
  db.auditLog = db.auditLog.filter(e=>{
    if(e.timestamp.slice(0,10) >= seuil) return true;
    if(e.action === 'critical' || e.action === 'delete') return true;
    return false;
  });
  const supprimes = avant - db.auditLog.length;
  logAudit('Audit','critical','','Purge du journal d\'audit — '+supprimes+' entrées supprimées (antérieures au '+seuil+')');
  saveDB();closeModal();renderAudit();
  toast(supprimes+' événements purgés (critiques préservés)','warning');
}

// ============================================================
// HOOKS AUDIT — intercepte les fonctions existantes
// ============================================================
(function installAuditHooks(){
  // Attendre que les fonctions soient définies
  if(typeof handleLogin==='undefined') return setTimeout(installAuditHooks, 100);

  // -- AUTHENTIFICATION --
  const _handleLogin = handleLogin;
  let loginBusy=false;
  window.handleLogin = async function(e){
    e.preventDefault();if(loginBusy)return;loginBusy=true;const button=document.querySelector('#loginScreen button[type=submit]');if(button)button.disabled=true;
    try{
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;

    if(!sb){
      toast('Supabase non configuré (voir SUPABASE_URL / SUPABASE_ANON_KEY)','danger');
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email: loginToEmail(u), password: p });
    if(error || !data.user){
      logAudit('Authentification','critical',u,'❌ Tentative de connexion échouée pour login "'+u+'"');
      saveDB();
      toast('Identifiants incorrects','danger');
      return;
    }

    const ok = await chargerSessionUtilisateur(data.user.id, u);
    if(!ok){
      db.currentUser=null; db.hotelId=null;
      toast("Compte connecté mais non configuré côté application — contacte l'administrateur",'danger');
      await sb.auth.signOut();
      return;
    }

    try { await chargerDonneesCoeur(); } catch(error) { await sb.auth.signOut(); db.currentUser=null; db.hotelId=null; toast(error.message,'danger'); return; }
    logAudit('Authentification','login',u,'Connexion réussie de '+db.currentUser.nom);
    saveDB();
    document.getElementById('loginScreen').style.display='none';
    filtrerMenuParRole();
    showApp();
    }catch(error){toast('Connexion impossible. Vérifiez le réseau et réessayez.','danger');}finally{loginBusy=false;if(button)button.disabled=false;}
  };

  // Logout awaits the pending write queue before ending the session.
  // -- CAISSE : ouverture / fermeture --
  if(typeof confirmerOuverture==='function'){
    const _co = confirmerOuverture;
    window.confirmerOuverture = function(e){
      _co(e);
      const s = sessionActive();
      if(s){
        logAudit('Session Caisse','create',s.numero,'🔓 Ouverture caisse avec fond initial de '+fmt(s.fondInitial),{
          numero:s.numero, fondInitial:s.fondInitial, note:s.noteOuverture
        });
        saveDB();
      }
    };
  }

  if(typeof confirmerFermeture==='function'){
    const _cf = confirmerFermeture;
    window.confirmerFermeture = function(e, sid){
      _cf(e, sid);
      const s = db.sessionsCaisse.find(x=>x.id===sid);
      if(s){
        const level = Math.abs(s.ecart) > 0 ? 'critical' : 'update';
        logAudit('Session Caisse', level, s.numero,
          '🔒 Fermeture caisse — Compté: '+fmt(s.montantCompte)+' / Attendu: '+fmt(s.montantAttendu)+
          (s.ecart!==0?' — ⚠ Écart de '+fmt(s.ecart):' — ✓ Équilibrée'),{
          numero:s.numero, montantCompte:s.montantCompte, montantAttendu:s.montantAttendu,
          ecart:s.ecart, note:s.noteFermeture
        });
        saveDB();
      }
    };
  }

  // -- CAISSE : mouvement --
  if(typeof saveMouvement==='function'){
    const _sm = saveMouvement;
    window.saveMouvement = function(e){
      _sm(e);
      const last = db.caisse[db.caisse.length-1];
      if(last){
        logAudit('Caisse', 'create', last.ref,
          (last.type==='entree'?'💵 Entrée: ':'💸 Sortie: ')+last.description+' — '+fmt(last.montant)+' ('+modeLabel(last.mode)+')',
          {ref:last.ref, montant:last.montant, mode:last.mode, type:last.type});
        saveDB();
      }
    };
  }

  if(typeof deleteMouv==='function'){
    const _dm = deleteMouv;
    window.deleteMouv = function(id){
      const c = db.caisse.find(x=>x.id===id);
      if(c){
        confirmDialog('Supprimer ce mouvement ?',()=>{
          logAudit('Caisse','delete',c.ref,'⚠ Suppression mouvement caisse: '+c.description+' — '+fmt(c.montant),{before:c});
          db.caisse=db.caisse.filter(x=>x.id!==id);
          saveDB();renderCaisse();toast('Supprimé');
        });
      }
    };
  }

  // -- RÉSERVATIONS --
  if(typeof saveResa==='function'){
    const _sr = saveResa;
    window.saveResa = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.reservations.find(x=>x.id===id))):null;
      _sr(e, id);
      const after = id?db.reservations.find(x=>x.id===id):db.reservations[db.reservations.length-1];
      if(after){
        logAudit('Réservations', id?'update':'create', after.ref,
          (id?'Modification':'Nouvelle')+' réservation '+after.ref+' — '+fmt(after.montant),
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof deleteResa==='function'){
    const _dr = deleteResa;
    window.deleteResa = function(id){
      const r = db.reservations.find(x=>x.id===id);
      if(r){ logAudit('Réservations','delete',r.ref,'Suppression réservation '+r.ref,{before:r}); }
      _dr(id);
    };
  }
  if(typeof checkinResa==='function'){
    const _ci = checkinResa;
    window.checkinResa = function(id){
      const r = db.reservations.find(x=>x.id===id);
      _ci(id);
      if(r){ logAudit('Réservations','critical',r.ref,'✅ Check-in de '+r.ref); saveDB(); }
    };
  }
  if(typeof checkoutResa==='function'){
    const _co2 = checkoutResa;
    window.checkoutResa = function(id){
      const r = db.reservations.find(x=>x.id===id);
      _co2(id);
      if(r){ logAudit('Réservations','critical',r.ref,'🚪 Check-out de '+r.ref); saveDB(); }
    };
  }

  // -- CHAMBRES --
  if(typeof saveRoom==='function'){
    const _sr = saveRoom;
    window.saveRoom = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.chambres.find(x=>x.id===id))):null;
      _sr(e, id);
      const after = id?db.chambres.find(x=>x.id===id):db.chambres[db.chambres.length-1];
      if(after){
        logAudit('Chambres', id?'update':'create', 'Ch. '+after.numero,
          (id?'Modification':'Ajout')+' chambre '+after.numero+' — '+after.type+' — '+fmt(after.prix),
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof deleteRoom==='function'){
    const _dr = deleteRoom;
    window.deleteRoom = function(id){
      const c = db.chambres.find(x=>x.id===id);
      if(c){ logAudit('Chambres','delete','Ch. '+c.numero,'Suppression chambre '+c.numero,{before:c}); }
      _dr(id);
    };
  }

  // -- CLIENTS --
  if(typeof saveClient==='function'){
    const _sc = saveClient;
    window.saveClient = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.clients.find(x=>x.id===id))):null;
      _sc(e,id);
      const after = id?db.clients.find(x=>x.id===id):db.clients[db.clients.length-1];
      if(after){
        logAudit('Clients', id?'update':'create', after.prenom+' '+after.nom,
          (id?'Modification':'Nouveau')+' client: '+after.prenom+' '+after.nom,
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof deleteClient==='function'){
    const _dc = deleteClient;
    window.deleteClient = function(id){
      const c = db.clients.find(x=>x.id===id);
      if(c){ logAudit('Clients','delete',c.prenom+' '+c.nom,'Suppression client',{before:c}); }
      _dc(id);
    };
  }

  // -- PERSONNEL --
  if(typeof saveEmp==='function'){
    const _se = saveEmp;
    window.saveEmp = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.personnel.find(x=>x.id===id))):null;
      _se(e,id);
      const after = id?db.personnel.find(x=>x.id===id):db.personnel[db.personnel.length-1];
      if(after){
        logAudit('Personnel', id?'update':'create', after.matricule||after.prenom+' '+after.nom,
          (id?'Modification':'Ajout')+' employé: '+after.prenom+' '+after.nom+' — '+after.poste+' — salaire '+fmt(after.salaire),
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof deleteEmp==='function'){
    const _de = deleteEmp;
    window.deleteEmp = function(id){
      const p = db.personnel.find(x=>x.id===id);
      if(p){ logAudit('Personnel','critical',p.matricule||p.nom,'⚠ Suppression employé: '+p.prenom+' '+p.nom,{before:p}); }
      _de(id);
    };
  }

  // -- PAIE --
  if(typeof savePaie==='function'){
    const _sp = savePaie;
    window.savePaie = function(e,id){
      _sp(e,id);
      const last = db.paies[db.paies.length-1];
      if(last){
        const emp = db.personnel.find(x=>x.id===last.personnelId);
        logAudit('Paie','create',last.numero,
          '💳 Bulletin '+last.numero+' — '+(emp?emp.prenom+' '+emp.nom:'—')+' — Net: '+fmt(last.salaireNet),
          {numero:last.numero, brut:last.salaireBrut, net:last.salaireNet, cnss:last.cnss, irpp:last.irpp});
        saveDB();
      }
    };
  }
  if(typeof deletePaie==='function'){
    const _dp = deletePaie;
    window.deletePaie = function(id){
      const p = db.paies.find(x=>x.id===id);
      if(p){ logAudit('Paie','critical',p.numero,'⚠ Suppression bulletin '+p.numero,{before:p}); }
      _dp(id);
    };
  }
  if(typeof genererPaieMassive==='function'){
    const _gpm = genererPaieMassive;
    window.genererPaieMassive = function(){
      const avant = db.paies.length;
      _gpm();
      setTimeout(()=>{
        const cree = db.paies.length - avant;
        if(cree>0){
          logAudit('Paie','critical','Génération massive','⚡ Génération massive de '+cree+' bulletins de paie',{nbBulletins:cree});
          saveDB();
        }
      },100);
    };
  }

  // -- FACTURES / RESTAURATION --
  if(typeof saveCommande==='function'){
    const _sc = saveCommande;
    window.saveCommande = function(e,id){
      _sc(e,id);
      const last = db.commandes[db.commandes.length-1];
      if(last){ logAudit('Restauration','create','CMD-'+(last.id||'').slice(-6),'Commande restaurant — '+fmt(last.total||0),{after:last}); saveDB(); }
    };
  }

  // -- STOCK --
  if(typeof saveStock==='function'){
    const _ss = saveStock;
    window.saveStock = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.stock.find(x=>x.id===id))):null;
      _ss(e,id);
      const after = id?db.stock.find(x=>x.id===id):db.stock[db.stock.length-1];
      if(after){
        logAudit('Stock', id?'update':'create', after.designation,
          (id?'Modification':'Ajout')+' article stock: '+after.designation+' — '+after.quantite+' '+after.unite,
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof saveMouvStock==='function'){
    const _sms = saveMouvStock;
    window.saveMouvStock = function(e){
      _sms(e);
      const last = db.mouvementsStock[db.mouvementsStock.length-1];
      if(last){
        const art = db.stock.find(x=>x.id===last.articleId);
        logAudit('Stock','update', art?art.designation:'—',
          (last.type==='entree'?'↑ Entrée':'↓ Sortie')+' stock: '+last.quantite+' × '+(art?art.designation:'—')+' — '+last.motif,
          last);
        saveDB();
      }
    };
  }

  // -- MAGASINS --
  if(typeof saveMagasin==='function'){
    const _sma = saveMagasin;
    window.saveMagasin = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.magasins.find(x=>x.id===id))):null;
      _sma(e,id);
      const after = id?db.magasins.find(x=>x.id===id):db.magasins[db.magasins.length-1];
      if(after){
        logAudit('Magasins', id?'update':'create', after.numero,
          (id?'Modification':'Ajout')+' magasin '+after.numero+': '+after.designation+' — '+fmt(after.tarifMensuel)+'/mois',
          id?{before,after}:{after});
        saveDB();
      }
    };
  }
  if(typeof saveLocation==='function'){
    const _sl = saveLocation;
    window.saveLocation = function(e,id){
      _sl(e,id);
      const last = db.locationsMagasin[db.locationsMagasin.length-1];
      if(last){ logAudit('Magasins','critical',last.numero,'📄 Contrat location: '+last.locataire+' — '+fmt(last.loyer)+'/mois',{after:last}); saveDB(); }
    };
  }

  // -- POINTAGES --
  if(typeof savePointage==='function'){
    const _spo = savePointage;
    window.savePointage = function(e,id){
      _spo(e,id);
      const last = db.pointages[db.pointages.length-1];
      if(last){
        const emp = db.personnel.find(x=>x.id===last.personnelId);
        logAudit('Pointage','create',emp?emp.matricule:'—',
          'Pointage: '+(emp?emp.prenom+' '+emp.nom:'—')+' — '+last.arrivee+'→'+(last.depart||'?')+' ('+last.shift+')',
          last);
        saveDB();
      }
    };
  }

  // -- DÉPENSES --
  if(typeof saveDepense==='function'){
    const _sd = saveDepense;
    window.saveDepense = function(e,id){
      _sd(e,id);
      const last = db.depenses[db.depenses.length-1];
      if(last){
        logAudit('Dépenses','create',last.ref||'DEP','Dépense: '+last.description+' — '+fmt(last.montant)+' ('+last.categorie+')',last);
        saveDB();
      }
    };
  }

  // -- COMPTABILITÉ --
  if(typeof saveEcriture==='function'){
    const _se = saveEcriture;
    window.saveEcriture = function(e){
      const avant = db.ecritures.length;
      _se(e);
      const nbLignes = db.ecritures.length - avant;
      if(nbLignes>0){
        const dernieres = db.ecritures.slice(-nbLignes);
        const totD = dernieres.reduce((s,x)=>s+x.debit,0);
        logAudit('Comptabilité','create',dernieres[0].piece,
          '✍ Écriture comptable ('+nbLignes+' lignes) — Journal '+dernieres[0].journal+' — '+fmt(totD),
          {piece:dernieres[0].piece, journal:dernieres[0].journal, lignes:dernieres});
        saveDB();
      }
    };
  }
  if(typeof deleteEcriture==='function'){
    const _dec = deleteEcriture;
    window.deleteEcriture = function(id){
      const e = db.ecritures.find(x=>x.id===id);
      if(e){ logAudit('Comptabilité','delete',e.piece,'⚠ Suppression ligne écriture: '+e.compte+' — D:'+fmt(e.debit)+' C:'+fmt(e.credit),{before:e}); }
      _dec(id);
    };
  }
  if(typeof genererEcrituresAuto==='function'){
    const _gea = genererEcrituresAuto;
    window.genererEcrituresAuto = function(){
      const avant = db.ecritures.length;
      _gea();
      setTimeout(()=>{
        const cree = db.ecritures.length - avant;
        if(cree>0){
          logAudit('Comptabilité','critical','Génération auto','⚡ Génération auto de '+cree+' écritures comptables',{nbEcritures:cree});
          saveDB();
        }
      },100);
    };
  }
  if(typeof cloturer==='function'){
    const _cl = cloturer;
    window.cloturer = function(){
      const avant = db.exercices.length;
      _cl();
      setTimeout(()=>{
        if(db.exercices.length > avant){
          const last = db.exercices[db.exercices.length-1];
          logAudit('Comptabilité','critical','Clôture '+last.periode,
            '🔒 Clôture '+last.type+' '+last.periode+' — Résultat: '+fmt(last.resultat),last);
          saveDB();
        }
      },100);
    };
  }

  // -- UTILISATEURS --
  if(typeof saveUser==='function'){
    const _su = saveUser;
    window.saveUser = function(e,id){
      const before = id?JSON.parse(JSON.stringify(db.users.find(x=>x.id===id))):null;
      _su(e,id);
      const after = id?db.users.find(x=>x.id===id):db.users[db.users.length-1];
      if(after){
        // NE PAS logguer le mot de passe
        const safeBef = before?{...before, password:'***'}:null;
        const safeAft = {...after, password:'***'};
        logAudit('Utilisateurs','critical',after.login,
          (id?'Modification':'Création')+' utilisateur: '+after.nom+' ('+after.login+') — '+after.role,
          id?{before:safeBef,after:safeAft}:{after:safeAft});
        saveDB();
      }
    };
  }
  if(typeof deleteUser==='function'){
    const _du = deleteUser;
    window.deleteUser = function(id){
      const u = db.users.find(x=>x.id===id);
      if(u){ logAudit('Utilisateurs','critical',u.login,'⚠ Suppression utilisateur: '+u.nom+' ('+u.login+')',{before:{...u,password:'***'}}); }
      _du(id);
    };
  }

  // -- PARAMÈTRES --
  if(typeof saveConfig==='function'){
    const _sc = saveConfig;
    window.saveConfig = function(){
      const before = JSON.parse(JSON.stringify(db.config));
      _sc();
      const after = JSON.parse(JSON.stringify(db.config));
      logAudit('Paramètres','update','Configuration',
        '⚙ Modification configuration établissement',{before,after});
      saveDB();
    };
  }

  // -- FACTURATION --
  if(typeof imprimerFacture==='function'){
    const _if = imprimerFacture;
    window.imprimerFacture = function(id){
      const f = db.factures.find(x=>x.id===id);
      if(f){ logAudit('Facturation','print',f.numero,'🖨 Impression facture '+f.numero+' — '+fmt(f.total),{numero:f.numero,total:f.total}); saveDB(); }
      _if(id);
    };
  }

  console.log('✅ Hooks d\'audit installés');
})();

// ============ MODAL ============
function openModal(title, body, footer){
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalFooter').innerHTML = footer||'';
  document.getElementById('modalBox').classList.remove('lg','xl');
  document.getElementById('modalOverlay').classList.add('active');
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('active');
}

// ============ RELIABILITY & SECURITY ============
const CORE = [
 ['chambres','chambres',chambreToDb,chambreFromDb],['clients','clients',clientToDb,clientFromDb],
 ['reservations','reservations',reservationToDb,reservationFromDb],['factures','factures',factureToDb,factureFromDb],
 ['menu','menu',menuToDb,menuFromDb],['commandes','commandes',commandeToDb,commandeFromDb],
 ['stock','stock',stockToDb,stockFromDb],['mouvementsStock','mouvements_stock',mouvStockToDb,mouvStockFromDb],
 ['depenses','depenses',depenseToDb,depenseFromDb],['caisse','caisse',caisseToDb,caisseFromDb],
 ['sessionsCaisse','sessions_caisse',sessionCaisseToDb,sessionCaisseFromDb]
];
const MODULES=['config','tablesResto','reservationsResto','formules','categoriesMenu','salles','evenements','proformas','devis','personnel','magasins','locationsMagasin','pointages','permanences','paies','planComptable','ecritures','exercices','operations'];
const IMPORT_KEYS=[...CORE.map(x=>x[0]),...MODULES];
let cloudReady=false, syncQueue=Promise.resolve(), syncScheduled=false, cloudBaseline=new Map(), baselineVersions=new Map();
let recoveryBlocked=false;
let localOwner=null,legacyCache=null;
try{
 const raw=localStorage.getItem('soonre-before-security-upgrade')||localStorage.getItem(STORE_KEY);
 if(raw){if(!localStorage.getItem('soonre-before-security-upgrade'))localStorage.setItem('soonre-before-security-upgrade',raw);legacyCache=JSON.parse(raw);localOwner=legacyCache?.hotelId||null;}
}catch{}
const isManager=()=>['Directeur Général','Gérant','Super Administrateur'].includes(db.currentUser?.role);
function requireManager(){if(isManager())return true;toast('Action réservée à la direction','danger');return false;}
function escapeInline(value){return escapeHtml(String(value??'').replace(/[\\'"\n\r<>]/g,c=>({'\\':'\\\\',"'":'\\u0027','"':'\\u0022','\n':'\\n','\r':'\\r','<':'\\u003c','>':'\\u003e'}[c])));}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function refreshRoomStatus(id){
 const ch=db.chambres.find(c=>c.id===id);if(!ch)return;
 const rs=db.reservations.filter(r=>r.chambreId===id);
 ch.statut=rs.some(r=>r.statut==='checkin')?'occupee':rs.some(r=>r.statut==='confirmee')?'reservee':'libre';
}
function clearSensitiveState(){for(const [key]of CORE)db[key]=[];for(const key of MODULES)db[key]=key==='config'?{...defaultConfig}:[];db.auditLog=[];db.users=[];}
function persistLocal(){
 try{db.users=[];localStorage.setItem(STORE_KEY,JSON.stringify(db));}
 catch(error){window.hotelSyncPending=true;console.error('Cache indisponible',error);toast('Impossible de conserver une copie locale : exportez les données avant de fermer','danger');}
}
function moduleAccessible(name,write=false){
 if(isManager())return true;
 if(db.currentUser?.role!=='Accueil / Réception')return false;
 return (write?['tablesResto','reservationsResto','evenements','proformas','devis','locationsMagasin']:['config','tablesResto','reservationsResto','formules','categoriesMenu','salles','evenements','proformas','devis','magasins','locationsMagasin']).includes(name);
}
function snapshotRows(){
 const rows=new Map();
 for(const[key,table,toDb]of CORE)for(const item of db[key]||[]){const row=toDb(item);rows.set(table+':'+row.id,{table,id:row.id,data:structuredClone(row)});}
 for(const name of MODULES){if(!moduleAccessible(name))continue;const id=db.hotelId+':'+name;rows.set('app_collections:'+id,{table:'app_collections',id,data:{id,hotel_id:db.hotelId,name,data:structuredClone(db[name]??(name==='config'?{...defaultConfig}:[]))}});}
 return rows;
}
async function readAll(table){
 let rows=[];
 for(let start=0;;start+=500){const{data,error}=await sb.from(table).select('*').eq('hotel_id',db.hotelId).order('id').range(start,start+499);if(error)throw new Error('Chargement '+table+' : '+error.message);rows.push(...data);if(data.length<500)break;}
 return rows;
}
async function loadCloudState({preserveLocalModules=true}={}){
 if(!sb||!db.hotelId||!db.currentUser?.actif)throw new Error('Session inactive');
 cloudReady=false;await syncQueue.catch(()=>{});
 const owner=db.hotelId;const cached={};
 if(preserveLocalModules&&localOwner===owner&&isManager())for(const name of MODULES)if((legacyCache?.[name]??db[name])!==undefined)cached[name]=structuredClone(legacyCache?.[name]??db[name]);
 const tables=await Promise.all(CORE.map(x=>readAll(x[1])));const modules=await readAll('app_collections');
 clearSensitiveState();cloudBaseline.clear();baselineVersions.clear();
 CORE.forEach(([key,table,toDb,fromDb],i)=>{
  db[key]=tables[i].map(fromDb);
  for(const row of tables[i])baselineVersions.set(table+':'+row.id,row.version);
 });
 for(const name of MODULES)if(moduleAccessible(name)&&cached[name]!==undefined)db[name]=cached[name];
 for(const row of modules){if(MODULES.includes(row.name)&&moduleAccessible(row.name)){db[row.name]=row.data;baselineVersions.set('app_collections:'+row.id,row.version);}}
 for(const[key,row]of snapshotRows()){
  if(row.table==='app_collections'&&!baselineVersions.has(key))continue;
  cloudBaseline.set(key,JSON.stringify(row.data));
 }
 localOwner=owner;legacyCache=null;cloudReady=true;window.hotelSyncPending=false;persistLocal();
 const recovery=localStorage.getItem(recoveryKey());
 recoveryBlocked=!!recovery;window.hotelSyncPending=!!recovery;
 if(recovery){toast('Des modifications attendent votre choix de récupération','warning');showRecoveryAction();}else clearRecoveryAction();
}
function recoveryKey(){return 'soonre-pending:'+db.hotelId+':'+db.currentUser.id;}
function persistRecovery(){
 const snapshot=Object.fromEntries(IMPORT_KEYS.filter(k=>Object.hasOwn(db,k)).map(k=>[k,db[k]]));
 localStorage.setItem(recoveryKey(),JSON.stringify({formatVersion:2,hotelId:db.hotelId,userId:db.currentUser.id,snapshot,baseline:[...cloudBaseline],versions:[...baselineVersions]}));
}
function clearRecoveryAction(){
 updateSyncStatus();
 document.getElementById('pendingRecovery')?.remove();
 document.querySelectorAll('#app .content,#modalOverlay').forEach(el=>el.inert=false);
}
async function retryRecovery(){
 try{
  const saved=JSON.parse(localStorage.getItem(recoveryKey()));
  if(saved?.formatVersion!==2||saved.hotelId!==db.hotelId||saved.userId!==db.currentUser.id)throw new Error('Cette ancienne copie doit être exportée pour récupération manuelle');
  validateImport(saved.snapshot);
  for(const key of IMPORT_KEYS)if(Object.hasOwn(saved.snapshot,key))db[key]=saved.snapshot[key];
  cloudBaseline=new Map(saved.baseline);baselineVersions=new Map(saved.versions);
  recoveryBlocked=false;persistLocal();await queueCloudSync();
  if(!window.hotelSyncPending){clearRecoveryAction();renderAll();}
 }catch(error){toast(error.message,'danger');}
}
function showRecoveryAction(){
 recoveryBlocked=true;window.hotelSyncPending=true;updateSyncStatus();
 document.querySelectorAll('#app .content,#modalOverlay').forEach(el=>el.inert=true);
 if(document.getElementById('pendingRecovery'))return;
 const banner=document.createElement('div');banner.id='pendingRecovery';banner.className='card';
 const label=document.createElement('p');label.textContent='Modifications non sauvegardées : réessayez, exportez une copie ou rechargez les données serveur.';banner.append(label);
 const action=(label,handler)=>{const b=document.createElement('button');b.className='btn btn-ghost';b.textContent=label;b.onclick=handler;banner.append(b);};
 action('Réessayer la sauvegarde',()=>retryRecovery());
 action('Exporter la copie',()=>{
  try{const saved=JSON.parse(localStorage.getItem(recoveryKey()));const source=saved?.formatVersion===2?saved.snapshot:saved;
   const exported=Object.fromEntries(IMPORT_KEYS.filter(k=>Object.hasOwn(source,k)).map(k=>[k,source[k]]));
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}));a.download='soonre-recuperation.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }catch(error){toast('Export impossible : '+error.message,'danger');}
 });
 action('Recharger les données serveur',async()=>{
  if(!confirm('Abandonner les modifications locales non sauvegardées et recharger les données serveur ?'))return;
  const key=recoveryKey();
  try{await loadCloudState({preserveLocalModules:false});localStorage.removeItem(key);recoveryBlocked=false;window.hotelSyncPending=false;clearRecoveryAction();renderAll();}
  catch(error){toast('Rechargement impossible : '+error.message,'danger');}
 });
 document.getElementById('app').prepend(banner);
}
function queueCloudSync(){
 if(!cloudReady||!db.currentUser?.actif||recoveryBlocked)return syncQueue;
 window.hotelSyncPending=true;updateSyncStatus();
 try{persistRecovery();}catch(error){toast('Copie de récupération indisponible : '+error.message,'warning');}
 if(syncScheduled)return syncQueue;
 syncScheduled=true;
 syncQueue=syncQueue.catch(()=>{}).then(async()=>{
  // Each iteration captures current changes only; stale unchanged rows are never rewritten.
  while(cloudReady){
   const rows=snapshotRows();const changes=[];
   for(const[key,row]of rows)if(cloudBaseline.get(key)!==JSON.stringify(row.data)){
    if(row.table==='app_collections'&&!moduleAccessible(row.data.name,true)){if(cloudBaseline.has(key))throw new Error('Modification non autorisée du module '+row.data.name);continue;}
    changes.push({...row,version:baselineVersions.get(key)??null});
   }
   for(const[key,data]of cloudBaseline)if(!rows.has(key)){const split=key.indexOf(':');changes.push({table:key.slice(0,split),id:key.slice(split+1),version:baselineVersions.get(key),delete:true});}
   if(!changes.length){window.hotelSyncPending=false;localStorage.removeItem(recoveryKey());clearRecoveryAction();break;}
   persistRecovery();
   const{data,error}=await sb.rpc('sync_hotel_changes',{p_hotel:db.hotelId,p_changes:changes});
   if(error)throw new Error(error.message);
   for(const result of data){const key=result.table+':'+result.id;if(result.deleted){cloudBaseline.delete(key);baselineVersions.delete(key);}else{const sent=changes.find(x=>x.table===result.table&&x.id===result.id);cloudBaseline.set(key,JSON.stringify(sent.data));baselineVersions.set(key,result.version);}}
  }
  if(!window.hotelSyncPending)toast('Sauvegarde serveur confirmée');
 }).catch(error=>{
  window.hotelSyncPending=true;console.error('Synchronisation refusée',error);toast('Sauvegarde serveur échouée : '+error.message+'. La copie locale est conservée.','danger');showRecoveryAction();
 }).finally(()=>{syncScheduled=false;});
 return syncQueue;
}
function validateImport(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Objet JSON attendu');
 for(const key of Object.keys(data))if(['__proto__','constructor','prototype','currentUser','hotelId','users'].includes(key))throw new Error('Champ interdit : '+key);
 const inspect=value=>{if(!value||typeof value!=='object')return;for(const key of Object.keys(value)){if(['__proto__','constructor','prototype'].includes(key))throw new Error('Champ interdit : '+key);inspect(value[key]);}};inspect(data);
 for(const key of IMPORT_KEYS){if(!Object.hasOwn(data,key))continue;if(key==='config'){if(!data[key]||typeof data[key]!=='object'||Array.isArray(data[key]))throw new Error('Configuration invalide');continue;}
  if(!Array.isArray(data[key]))throw new Error('Collection invalide : '+key);
  if(data[key].some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('Enregistrements invalides : '+key);
  if(CORE.some(x=>x[0]===key)&&new Set(data[key].map(row=>row?.id)).size!==data[key].length)throw new Error('Identifiants dupliqués : '+key);
  if(CORE.some(x=>x[0]===key))for(const row of data[key])if(!row||typeof row.id!=='string'||!/^[-A-Za-z0-9_:]+$/.test(row.id))throw new Error('Identifiant invalide');
 }
}
window.addEventListener('online',()=>{updateSyncStatus();queueCloudSync();});
window.addEventListener('offline',()=>updateSyncStatus());
window.addEventListener('beforeunload',event=>{if(window.hotelSyncPending){event.preventDefault();event.returnValue='';}});
// Never grant permissions merely by hiding a menu. These checks complement RLS.
const originalShowPage=showPage;
showPage=function(name){
 const role=db.currentUser?.role;
 const restricted={personnel:true,pointage:true,paie:true,comptabilite:true,depenses:true,audit:true};
 if(!db.currentUser?.actif || (['Ménage','Maintenance'].includes(role)&&name!=='chambres') || (restricted[name]&&!isManager())){toast('Accès refusé','danger');return;}
 originalShowPage(name);if(name==='audit')loadServerAudit();
};
const originalFilterMenu=filtrerMenuParRole;
filtrerMenuParRole=function(){originalFilterMenu();if(!isManager())document.querySelectorAll('.nav-item').forEach(item=>{if(['personnel','pointage','paie','comptabilite','depenses','audit'].includes(item.dataset.page))item.style.display='none';});};
// Financial movements and deleting records require a manager. Routine invoicing remains available at reception.
for(const name of ['saveStock','saveMouvStock','saveMenu','toggleDispoMenu','savePersonnel','savePointage','savePermanence','savePaie','genererPaieMassive','confirmerOuverture','confirmerFermeture','saveMouvement','deleteMouv','saveDepense','deleteDepense','deleteFacture','deleteRoom','deleteClient','deleteStock','deleteCommande','deleteMenu','saveConfig','importData','resetData','purgerAudit','confirmerPurgeAudit']){
 const original=window[name];if(typeof original==='function')window[name]=function(...args){if(!requireManager()){args[0]?.preventDefault?.();return;}return original(...args);};
}
const originalSaveRoom=saveRoom;
saveRoom=function(event,id){
 if(isManager())return originalSaveRoom(event,id);
 event.preventDefault();const room=db.chambres.find(c=>c.id===id);if(!room){toast('Action réservée à la direction','danger');return;}
 const statut=document.getElementById('chStatut').value;
 if(['Ménage','Maintenance'].includes(db.currentUser?.role)&&(!['libre','maintenance'].includes(statut)||(['occupee','reservee'].includes(room.statut)&&room.statut!==statut))){toast('Statut non autorisé','danger');return;}
 room.statut=statut;saveDB();closeModal();renderRooms();
};
async function loadServerAudit(){
 const{data,error}=await safeQuery(sb.from('audit_events').select('*').eq('hotel_id',db.hotelId).order('id',{ascending:false}).limit(1000));
 if(error){toast('Journal serveur indisponible : '+error.message,'danger');return;}
 db.auditLog=data.reverse().map(e=>({id:'server_'+e.id,timestamp:e.event_at,userId:e.actor,userLogin:e.actor||'Système',userName:e.actor||'Système',userRole:'Serveur',module:e.table_name,action:({INSERT:'create',UPDATE:'update',DELETE:'delete'})[e.operation]||e.operation,entity:e.entity_id,description:e.operation+' '+e.table_name,details:{before:e.before_row,after:e.after_row}}));renderAudit();
}
// Sanitize generated HTML while preserving only original, structurally known event handlers.
// Interpolated text is escaped at template leaf sites; DOMPurify is a second barrier.
if(!window.DOMPurify)throw new Error('Protection HTML indisponible');
const innerHtmlDescriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
Object.defineProperty(Element.prototype,'innerHTML',{...innerHtmlDescriptor,set(value){
 const safe=DOMPurify.sanitize(String(value),{ADD_ATTR:['onclick','onchange','onsubmit','oninput'],FORBID_TAGS:['script','iframe','object','embed','svg','math'],FORBID_ATTR:['srcdoc'],ALLOW_DATA_ATTR:true});
 innerHtmlDescriptor.set.call(this,safe);
}});

// ============ INIT ============
loadDB();
async function demarrerApp(){
  if(sb){
    const { data:{ session } } = await sb.auth.getSession();
    if(session?.user){
      const ok = await chargerSessionUtilisateur(session.user.id);
      if(ok){
        try { await chargerDonneesCoeur(); } catch(error) { await sb.auth.signOut(); db.currentUser=null; db.hotelId=null; toast(error.message,'danger'); document.getElementById('loginScreen').style.display='flex'; return; }
        setTimeout(()=>{ try{ logAudit('Système','view','App','Démarrage de l\'application'); saveDB(); }catch(e){} }, 200);
        document.getElementById('loginScreen').style.display='none';
        filtrerMenuParRole();
        showApp();
        return;
      }
    }
  }
  db.currentUser = null; db.hotelId=null; clearSensitiveState();
  setTimeout(()=>{ try{ logAudit('Système','view','App','Démarrage de l\'application'); saveDB(); }catch(e){} }, 200);
  document.getElementById('loginScreen').style.display='flex';
}
demarrerApp().catch(error=>{db.currentUser=null;db.hotelId=null;cloudReady=false;clearSensitiveState();document.getElementById('loginScreen').style.display='flex';toast('Connexion impossible. Vérifiez le réseau et réessayez.','danger');});


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
  }

function mountHotelSelector(hotels,selected){
 let select=document.getElementById('activeHotel');
 if(!select){select=document.createElement('select');select.id='activeHotel';select.className='form-control';select.setAttribute('aria-label','Hôtel actif');document.querySelector('.topbar').append(select);}
 select.replaceChildren(...hotels.map(h=>{const option=document.createElement('option');option.value=h.id;option.textContent=h.nom;return option;}));select.value=selected;
 select.onchange=async()=>{const old=db.hotelId;await queueCloudSync();if(window.hotelSyncPending||recoveryBlocked){select.value=old;toast('Terminez ou récupérez la sauvegarde avant de changer d’hôtel','warning');return;}
 try{cloudReady=false;db.hotelId=select.value;localStorage.setItem('soonre-hotel:'+db.currentUser.id,db.hotelId);await loadCloudState();showApp();}catch(error){db.hotelId=old;select.value=old;toast(error.message,'danger');}
 };
}
