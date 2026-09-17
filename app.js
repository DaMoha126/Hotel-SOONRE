const initialReservations = [
  { client: 'Mariam Ouédraogo', detail: '2 personnes · Suite', room: '204', time: '14:00', status: 'Arrivée', kind: 'arrival', dates: '16 → 19 sept.' },
  { client: 'Jean Kouamé', detail: '1 personne · Standard', room: '112', time: '15:30', status: 'Attendu', kind: 'expected', dates: '16 → 18 sept.' },
  { client: 'Sophie Traoré', detail: '3 personnes · Deluxe', room: '301', time: '17:00', status: 'Arrivée', kind: 'arrival', dates: '16 → 20 sept.' },
  { client: 'Ousmane Diallo', detail: '2 personnes · Standard', room: '108', time: 'En séjour', status: 'En séjour', kind: 'stay', dates: '14 → 17 sept.' }
];
let reservations = JSON.parse(localStorage.getItem('alize-reservations') || 'null') || initialReservations;
const roomStates = [{n:'101',t:'Standard',s:'free'},{n:'102',t:'Standard',s:'busy'},{n:'204',t:'Deluxe',s:'busy'},{n:'212',t:'Standard',s:'clean'},{n:'301',t:'Deluxe',s:'busy'},{n:'306',t:'Suite',s:'free'},{n:'308',t:'Suite',s:'busy'},{n:'315',t:'Deluxe',s:'free'}];

function tag(r){ return `<span class="tag ${r.kind}">${r.status}</span>`; }
function render(){
  const arrivalsBody = document.querySelector('#arrivalsBody');
  const reservationsBody = document.querySelector('#reservationsBody');
  const reservationCount = document.querySelector('#reservationCount');
  const roomGrid = document.querySelector('#roomGrid');
  if (arrivalsBody) arrivalsBody.innerHTML = reservations.slice(0,3).map(r => `<tr><td><strong>${r.client}</strong><small>${r.detail}</small></td><td>${r.room}</td><td>${r.time}</td><td>${tag(r)}</td></tr>`).join('');
  if (reservationsBody) reservationsBody.innerHTML = reservations.map(r => `<tr><td><strong>${r.client}</strong><small>${r.detail}</small></td><td>${r.dates}</td><td>${r.room}</td><td>${tag(r)}</td></tr>`).join('');
  if (reservationCount) reservationCount.textContent = reservations.filter(r => r.kind === 'arrival').length;
  if (roomGrid) roomGrid.innerHTML = roomStates.map(r => `<article class="room ${r.s}"><h3>${r.n}</h3><p>${r.t}</p><span>${r.s === 'free' ? '● Disponible' : r.s === 'clean' ? '● À nettoyer' : '● Occupée'}</span></article>`).join('');
}
function display(view){
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('current', v.id === view));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  const title = document.querySelector(`#${view} h2`);
  const pageTitle = document.querySelector('#pageTitle');
  if (pageTitle) pageTitle.textContent = view === 'dashboard' ? 'Bonjour, Amadou ✦' : title ? title.textContent : view;
}
document.querySelectorAll('[data-view]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); display(a.dataset.view); }));
const modal = document.querySelector('#bookingModal');
const openModal = document.querySelector('#openModal');
const openModal2 = document.querySelector('#openModal2');
if (openModal && modal) openModal.onclick = () => modal.showModal ? modal.showModal() : modal.classList.add('active');
if (openModal2 && modal) openModal2.onclick = () => modal.showModal ? modal.showModal() : modal.classList.add('active');
const bookingForm = document.querySelector('#bookingForm');
if (bookingForm) bookingForm.addEventListener('submit', event => {
  const fd = new FormData(event.currentTarget); const client = fd.get('client');
  if (!client) return;
  const fmt = date => new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(date));
  reservations.unshift({client,detail:'1 personne · Réservation directe',room:fd.get('room').split(' ')[0],time:'À confirmer',status:'Attendu',kind:'expected',dates:`${fmt(fd.get('arrival'))} → ${fmt(fd.get('departure'))}`});
  localStorage.setItem('alize-reservations', JSON.stringify(reservations)); render(); display('reservations');
});
const date = new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
const today = document.querySelector('#today');
if (today) today.textContent = date.toUpperCase();
render();

/* ================= MAINTENANCE & MÉNAGE ================= */
(function initOperationsModules() {
  function start() {
    if (document.querySelector('#operations-modules')) return;

    const storageKey = 'hotel-soonre-operations-v1';
    let operations = JSON.parse(localStorage.getItem(storageKey) || 'null') || [
      { id: 1, type: 'menage', title: 'Nettoyage chambre 212', room: '212', assignee: 'Équipe ménage', priority: 'Normale', status: 'À faire', notes: '' },
      { id: 2, type: 'maintenance', title: 'Vérifier la climatisation', room: '204', assignee: 'Équipe maintenance', priority: 'Haute', status: 'En cours', notes: '' }
    ];

    const nav = document.querySelector('.sidebar-nav, .sidebar nav, nav');
    const content = document.querySelector('.content, main');
    if (!nav || !content) return;

    const style = document.createElement('style');
    style.id = 'operations-module-style';
    style.textContent = `
      #operations-modules{display:flex;flex-direction:column;gap:20px}
      .operations-page{display:none}
      .operations-page.active{display:block;animation:fadeIn .2s}
      .operations-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
      .operations-toolbar select,.operations-toolbar input,.operations-form input,.operations-form select,.operations-form textarea{padding:9px 11px;border:1px solid var(--line,#e2e8f0);border-radius:8px;background:#fff;color:var(--ink,#1e293b);font:inherit}
      .operations-toolbar select{min-width:150px}
      .operations-table{width:100%;border-collapse:collapse;font-size:13px}
      .operations-table th{background:var(--cream-2,#eef2ff);padding:10px;text-align:left;font-size:11px;text-transform:uppercase;color:var(--brown-dark,#0f172a)}
      .operations-table td{padding:10px;border-bottom:1px solid var(--line,#e2e8f0);vertical-align:middle}
      .operation-badge{display:inline-block;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap}
      .operation-badge.todo{background:#fff7ed;color:#c2410c}.operation-badge.progress{background:#eff6ff;color:#2563eb}.operation-badge.done{background:#ecfdf5;color:#047857}
      .operation-badge.high{background:#fef2f2;color:#b91c1c}.operation-badge.normal{background:#f1f5f9;color:#475569}
      .operations-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
      .operations-form .full{grid-column:1/-1}.operations-form label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:700;color:var(--brown-dark,#0f172a)}
      .operations-form button{justify-self:start;padding:10px 16px;border-radius:8px;background:var(--brown,#1d4ed8);color:#fff;font-weight:700}
      .operations-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}
      .operations-kpi{padding:14px;border:1px solid var(--line,#e2e8f0);border-radius:10px;background:#fff}.operations-kpi strong{display:block;font-size:24px;color:var(--brown-dark,#0f172a)}.operations-kpi span{font-size:11px;color:var(--muted,#64748b)}
      @media(max-width:768px){.operations-form{grid-template-columns:1fr}.operations-kpis{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const addNavItem = (type, icon, label) => {
      const item = document.createElement('a');
      item.href = '#'; item.className = 'nav-item operations-nav-item'; item.dataset.operationView = type;
      item.innerHTML = `<span class="icon">${icon}</span><span>${label}</span>`;
      nav.appendChild(item);
      item.addEventListener('click', event => { event.preventDefault(); showPage(type); });
    };
    addNavItem('maintenance', '🔧', 'Maintenance');
    addNavItem('menage', '🧹', 'Ménage');

    const wrapper = document.createElement('section');
    wrapper.id = 'operations-modules';
    wrapper.innerHTML = `
      <section id="maintenance" class="operations-page">
        <div class="card-header"><div><h2>Maintenance</h2><p style="color:var(--muted);font-size:12px">Suivi des interventions techniques et des équipements.</p></div><button class="btn btn-primary" data-open-operation="maintenance">+ Nouvelle intervention</button></div>
        <div class="operations-kpis"><div class="operations-kpi"><strong data-kpi="maintenance-todo">0</strong><span>À faire</span></div><div class="operations-kpi"><strong data-kpi="maintenance-progress">0</strong><span>En cours</span></div><div class="operations-kpi"><strong data-kpi="maintenance-done">0</strong><span>Terminées</span></div></div>
        <div class="card"><div class="operations-toolbar"><select data-filter="maintenance"><option value="all">Tous les statuts</option><option>À faire</option><option>En cours</option><option>Terminée</option></select><input data-search="maintenance" placeholder="Rechercher une intervention…" /></div><div class="table-wrap"><table class="operations-table"><thead><tr><th>Intervention</th><th>Chambre</th><th>Responsable</th><th>Priorité</th><th>Statut</th><th>Action</th></tr></thead><tbody data-body="maintenance"></tbody></table></div></div>
        <div class="card" data-form-card="maintenance" hidden><h3>Nouvelle intervention</h3><form class="operations-form" data-form="maintenance"><label>Intitulé<input name="title" required placeholder="Ex. Réparer la climatisation" /></label><label>Chambre / zone<input name="room" required placeholder="Ex. 204 ou Réception" /></label><label>Responsable<select name="assignee"><option>Équipe maintenance</option><option>Technicien externe</option><option>Responsable technique</option></select></label><label>Priorité<select name="priority"><option>Normale</option><option>Haute</option></select></label><label class="full">Notes<textarea name="notes" placeholder="Détails de l'intervention"></textarea></label><button type="submit">Enregistrer</button></form></div>
      </section>
      <section id="menage" class="operations-page">
        <div class="card-header"><div><h2>Ménage</h2><p style="color:var(--muted);font-size:12px">Organisation du nettoyage et préparation des chambres.</p></div><button class="btn btn-primary" data-open-operation="menage">+ Nouvelle tâche</button></div>
        <div class="operations-kpis"><div class="operations-kpi"><strong data-kpi="menage-todo">0</strong><span>À faire</span></div><div class="operations-kpi"><strong data-kpi="menage-progress">0</strong><span>En cours</span></div><div class="operations-kpi"><strong data-kpi="menage-done">0</strong><span>Terminées</span></div></div>
        <div class="card"><div class="operations-toolbar"><select data-filter="menage"><option value="all">Tous les statuts</option><option>À faire</option><option>En cours</option><option>Terminée</option></select><input data-search="menage" placeholder="Rechercher une tâche…" /></div><div class="table-wrap"><table class="operations-table"><thead><tr><th>Tâche</th><th>Chambre</th><th>Responsable</th><th>Priorité</th><th>Statut</th><th>Action</th></tr></thead><tbody data-body="menage"></tbody></table></div></div>
        <div class="card" data-form-card="menage" hidden><h3>Nouvelle tâche de ménage</h3><form class="operations-form" data-form="menage"><label>Intitulé<input name="title" required placeholder="Ex. Nettoyage chambre 301" /></label><label>Chambre / zone<input name="room" required placeholder="Ex. 301" /></label><label>Responsable<select name="assignee"><option>Équipe ménage</option><option>Femme / valet de chambre</option><option>Gouvernant(e)</option></select></label><label>Priorité<select name="priority"><option>Normale</option><option>Haute</option></select></label><label class="full">Notes<textarea name="notes" placeholder="Détails ou consignes"></textarea></label><button type="submit">Enregistrer</button></form></div>
      </section>`;
    content.appendChild(wrapper);

    function statusClass(status) { return status === 'Terminée' ? 'done' : status === 'En cours' ? 'progress' : 'todo'; }
    function priorityClass(priority) { return priority === 'Haute' ? 'high' : 'normal'; }
    function showPage(type) {
      document.querySelectorAll('.page.active,.view.current').forEach(page => page.classList.remove('active','current'));
      document.querySelectorAll('.operations-page').forEach(page => page.classList.toggle('active', page.id === type));
      document.querySelectorAll('.operations-nav-item').forEach(item => item.classList.toggle('active', item.dataset.operationView === type));
      document.querySelectorAll('.nav-item[data-view],.nav-link[data-view]').forEach(item => item.classList.remove('active'));
      const title = document.querySelector('#pageTitle');
      if (title) title.textContent = type === 'maintenance' ? 'Maintenance' : 'Ménage';
      renderOperations(type);
    }
    function renderOperations(type) {
      const list = operations.filter(operation => operation.type === type);
      const filter = document.querySelector(`[data-filter="${type}"]`)?.value || 'all';
      const query = (document.querySelector(`[data-search="${type}"]`)?.value || '').toLowerCase();
      const filtered = list.filter(operation => (filter === 'all' || operation.status === filter) && `${operation.title} ${operation.room} ${operation.assignee}`.toLowerCase().includes(query));
      const body = document.querySelector(`[data-body="${type}"]`);
      if (body) body.innerHTML = filtered.length ? filtered.map(operation => `<tr><td><strong>${escapeHtml(operation.title)}</strong><small style="display:block;color:var(--muted)">${escapeHtml(operation.notes || '')}</small></td><td>${escapeHtml(operation.room)}</td><td>${escapeHtml(operation.assignee)}</td><td><span class="operation-badge ${priorityClass(operation.priority)}">${escapeHtml(operation.priority)}</span></td><td><select data-status="${operation.id}" aria-label="Statut"><option ${operation.status === 'À faire' ? 'selected' : ''}>À faire</option><option ${operation.status === 'En cours' ? 'selected' : ''}>En cours</option><option ${operation.status === 'Terminée' ? 'selected' : ''}>Terminée</option></select></td><td><button class="btn btn-sm btn-danger" data-delete-operation="${operation.id}">Supprimer</button></td></tr>`).join('') : `<tr><td colspan="6"><div class="empty">Aucune tâche trouvée.</div></td></tr>`;
      ['À faire','En cours','Terminée'].forEach((status, index) => {
        const key = `${type}-${['todo','progress','done'][index]}`;
        const counter = document.querySelector(`[data-kpi="${key}"]`);
        if (counter) counter.textContent = list.filter(operation => operation.status === status).length;
      });
      body?.querySelectorAll('[data-status]').forEach(select => select.addEventListener('change', event => { const operation = operations.find(item => item.id === Number(event.target.dataset.status)); if (operation) { operation.status = event.target.value; persist(); renderOperations(type); } }));
      body?.querySelectorAll('[data-delete-operation]').forEach(button => button.addEventListener('click', () => { operations = operations.filter(operation => operation.id !== Number(button.dataset.deleteOperation)); persist(); renderOperations(type); }));
    }
    function persist() { localStorage.setItem(storageKey, JSON.stringify(operations)); }
    function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[character])); }

    document.querySelectorAll('[data-open-operation]').forEach(button => button.addEventListener('click', () => { const card = document.querySelector(`[data-form-card="${button.dataset.openOperation}"]`); if (card) card.hidden = !card.hidden; }));
    document.querySelectorAll('[data-form]').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const type = form.dataset.form; const data = new FormData(form);
      operations.push({ id: Date.now(), type, title: data.get('title'), room: data.get('room'), assignee: data.get('assignee'), priority: data.get('priority'), status: 'À faire', notes: data.get('notes') || '' });
      persist(); form.reset(); form.closest('[data-form-card]').hidden = true; renderOperations(type);
    }));
    document.querySelectorAll('[data-filter],[data-search]').forEach(control => control.addEventListener('input', () => renderOperations(control.dataset.filter || control.dataset.search)));
    renderOperations('maintenance'); renderOperations('menage');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
