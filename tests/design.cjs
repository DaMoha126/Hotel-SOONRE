const fs=require('fs'),path=require('path'),assert=require('assert');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
class Loader extends ResourceLoader{fetch(url){if(url.includes('chart'))return Promise.resolve(Buffer.from('window.Chart=class{constructor(){this.destroy=()=>{}}};'));if(url.includes('supabase.js'))return Promise.resolve(Buffer.from('window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}})}})};'));if(url.startsWith('https://soonre.test/'))return Promise.resolve(fs.readFileSync(path.join(root,new URL(url).pathname)));return Promise.resolve(Buffer.from(''));}}
(async()=>{
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://soonre.test/index.html',runScripts:'dangerously',resources:new Loader(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;}});
 await new Promise(r=>dom.window.addEventListener('load',r));
 const passed=dom.window.eval(`(()=>{
 const passed=[],check=(ok,name)=>{if(!ok)throw Error(name);passed.push(name);};
 db.currentUser={id:'u',nom:'Direction',role:'Directeur Général',actif:true};cloudReady=false;
 db.clients=[{id:'c',nom:'Test',prenom:'Client'}];db.chambres=[{id:'r',numero:'1',prix:100,statut:'libre'},{id:'free',numero:'2',prix:0,statut:'libre'}];db.reservations=[];
 openResaModal();document.getElementById('rChambre').value='r';document.getElementById('rArrivee').value='2026-11-01';document.getElementById('rDepart').value='2026-11-03';calcResaTotal();check(document.getElementById('rMontant').value==='200','Calculates automatic stay price');
 document.getElementById('rChambre').value='free';calcResaTotal();check(document.getElementById('rMontant').value==='0','Clears previous price for a zero-priced room');
 document.getElementById('rChambre').value='r';document.getElementById('rDepart').value='';calcResaTotal();check(document.getElementById('rMontant').value==='0','Clears stale price for incomplete dates');
 check(document.getElementById('rMontant').readOnly,'Keeps reservation amount automatic');
 db.chambres[0].statut='maintenance';db.reservations=[{id:'x',chambreId:'r',statut:'confirmee'}];refreshRoomStatus('r');check(db.chambres[0].statut==='maintenance','Preserves maintenance after booking refresh');
 const opener=document.createElement('button');opener.textContent='Open';document.body.append(opener);closeModal();opener.focus();openModal('Accessible test','<div class="form-group"><label>Nom</label><input id="focusTest"></div>','<button id="lastAction">Save</button>');
 const box=document.getElementById('modalBox');check(box.getAttribute('role')==='dialog'&&box.getAttribute('aria-labelledby')==='modalTitle','Exposes named modal dialog');check(document.activeElement.id==='focusTest'&&document.querySelector('label[for="focusTest"]'),'Focuses and labels modal input');
 document.getElementById('lastAction').focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));check(document.activeElement.classList.contains('close-btn'),'Wraps modal keyboard focus');
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));check(!document.getElementById('modalOverlay').classList.contains('active')&&document.activeElement===opener&&!document.getElementById('app').inert,'Escape closes modal and restores focus');
 window.open=()=>null;printInvoice();check(document.getElementById('toastContainer').textContent.includes('fenêtres surgissantes'),'Explains blocked print popup without crashing');
 check(document.querySelectorAll('.nav-item[data-page="comptabilite"]').length===1,'Provides one accounting navigation item');
 check(!document.getElementById('kpiCATrend').textContent.includes('+12%'),'Removes fabricated revenue trend');
 check(!document.querySelector('[onclick="purgerAudit()"]')&&typeof purgerAudit==='undefined','Removes misleading local-only audit purge');
 closeModal();return passed;
 })()`);
 assert.deepEqual(errors,[]);console.log(passed.map(x=>'PASS '+x).join('\n'));dom.window.close();
})().catch(e=>{console.error(e);process.exit(1);});
