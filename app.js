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
  document.querySelector('#arrivalsBody').innerHTML = reservations.slice(0,3).map(r => `<tr><td><strong>${r.client}</strong><small>${r.detail}</small></td><td>${r.room}</td><td>${r.time}</td><td>${tag(r)}</td></tr>`).join('');
  document.querySelector('#reservationsBody').innerHTML = reservations.map(r => `<tr><td><strong>${r.client}</strong><small>${r.detail}</small></td><td>${r.dates}</td><td>${r.room}</td><td>${tag(r)}</td></tr>`).join('');
  document.querySelector('#reservationCount').textContent = reservations.filter(r => r.kind === 'arrival').length;
  document.querySelector('#roomGrid').innerHTML = roomStates.map(r => `<article class="room ${r.s}"><h3>${r.n}</h3><p>${r.t}</p><span>${r.s === 'free' ? '● Disponible' : r.s === 'clean' ? '● À nettoyer' : '● Occupée'}</span></article>`).join('');
}
function display(view){
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('current', v.id === view));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  document.querySelector('#pageTitle').textContent = view === 'dashboard' ? 'Bonjour, Amadou ✦' : document.querySelector(`#${view} h2`).textContent;
}
document.querySelectorAll('[data-view]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); display(a.dataset.view); }));
const modal = document.querySelector('#bookingModal');
document.querySelector('#openModal').onclick = () => modal.showModal();
document.querySelector('#openModal2').onclick = () => modal.showModal();
document.querySelector('#bookingForm').addEventListener('submit', event => {
  const fd = new FormData(event.currentTarget); const client = fd.get('client');
  if (!client) return;
  const fmt = date => new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(date));
  reservations.unshift({client,detail:'1 personne · Réservation directe',room:fd.get('room').split(' ')[0],time:'À confirmer',status:'Attendu',kind:'expected',dates:`${fmt(fd.get('arrival'))} → ${fmt(fd.get('departure'))}`});
  localStorage.setItem('alize-reservations', JSON.stringify(reservations)); render(); display('reservations');
});
const date = new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
document.querySelector('#today').textContent = date.toUpperCase(); render();

// Remove the version and copyright labels from the sidebar footer.
document.querySelectorAll('.sidebar-footer').forEach(footer => {
  footer.querySelectorAll('div').forEach(item => {
    const text = item.textContent.trim();
    if (text === 'v2.0.0 — TDR édition' || text === '© 2026 Hadotech') {
      item.remove();
    }
  });
});
