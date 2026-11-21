const fs=require('fs'),path=require('path'),assert=require('assert');const{JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
class Loader extends ResourceLoader{fetch(url){if(url.includes('chart'))return Promise.resolve(Buffer.from('window.Chart=class{constructor(ctx,config){this.data=config.data;this.update=()=>{};this.destroy=()=>{}}};'));if(url.includes('supabase.js'))return Promise.resolve(Buffer.from('window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),signOut:async()=>({error:null})}})};'));if(url.startsWith('https://soonre.test/')){const file=path.join(root,new URL(url).pathname);return Promise.resolve(fs.readFileSync(file));}return Promise.resolve(Buffer.from(''));}}
(async()=>{const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://soonre.test/index.html',runScripts:'dangerously',resources:new Loader(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.confirm=()=>true;}});await new Promise(r=>dom.window.addEventListener('load',r));await new Promise(r=>setTimeout(r,300));assert.deepEqual(errors,[],'Startup errors');
const results=await dom.window.eval(String.raw`(()=>{
 const checks=[];function check(value,name){if(!value)throw Error(name);checks.push(name);}
 const fixture={factures:[{id:'f',date:'2026-11-05',total:400,paye:350,clientId:'c'},{id:'older',date:'2026-10-03',total:100,paye:0,clientId:'c'}],caisse:[{date:'2026-11-05',type:'entree',mode:'espece',montant:200},{date:'2026-11-05',type:'entree',mode:'mobile',montant:150},{date:'2026-11-06',type:'sortie',mode:'espece',montant:70},{date:'2026-10-25',type:'entree',mode:'carte',montant:100},{date:'2026-11-22',type:'entree',mode:'espece',montant:999}],reservations:[{arrivee:'2026-11-05',statut:'checkin'},{arrivee:'2026-11-07',statut:'annulee'}],chambres:[{statut:'occupee'},{statut:'libre'}],clients:[{id:'c',nom:'<img src=x onerror=alert(1)>',prenom:'Test'}]};
 const model=SOONRE_ANALYTICS.compute(fixture,'2026-11-01','2026-11-21');
 check(model.billed===400&&model.incoming===350&&model.outgoing===70&&model.balance===280,'Separates invoices, cash receipts and outgoing movements without double counting');
 check(model.previousIncoming===100,'Compares an equally long previous period');
 check(model.outstanding===150,'Outstanding balances use current unpaid values across all dates');
 check(model.stays===1&&model.cancelled===1,'Excludes cancelled stays from arrivals while reporting cancellations');
 check(model.occupancy===50&&model.roomCount===2,'Labels current room occupancy from room states');
 check(model.buckets.reduce((s,b)=>s+b.in,0)===350&&model.modes.reduce((s,b)=>s+b.total,0)===350,'Chart and payment mode totals reconcile with cash receipts');
 check(model.topClients[0].billed===400&&model.topClients[0].count===1,'Top clients are ranked on invoices in the selected period');
 check(SOONRE_ANALYTICS.period('2026-11-21','2026-11-21').days===1,'Custom periods include both selected boundary dates');
 let blocked=0;for(const [a,b]of [['2026-02-30','2026-03-01'],['2026-11-21','2026-11-01'],['2000-01-01','2026-11-21']])try{SOONRE_ANALYTICS.period(a,b)}catch{blocked++;}check(blocked===3,'Rejects invalid, reversed and excessively long periods');
 const empty=SOONRE_ANALYTICS.compute({},'2026-01-01','2026-12-31');check(empty.billed===0&&empty.incoming===0&&empty.occupancy===null&&empty.buckets.length===12,'Empty data stays honest and long periods use bounded monthly buckets');
 check(SOONRE_ANALYTICS.csvCell('=CMD()').startsWith('"\'')&&SOONRE_ANALYTICS.csvCell('+danger').startsWith('"\'')&&SOONRE_ANALYTICS.csvCell(-10)==='-10','CSV prevents formula injection while retaining numeric amounts');
 db.currentUser={id:'manager',nom:'Manager',role:'Gérant',actif:true};db.hotelId='hotel-test';localOwner='hotel-test';cloudReady=true;Object.assign(db,fixture);filtrerMenuParRole();
 document.getElementById('analysisFrom').value='2026-11-01';document.getElementById('analysisTo').value='2026-11-21';showPage('analyses');
 check(document.getElementById('page-analyses').classList.contains('active')&&!document.getElementById('analysisResults').hidden,'Manager opens functional analyses page');
 check(!document.getElementById('analysisClients').querySelector('img')&&document.getElementById('analysisClients').textContent.includes('<img'),'Renders client names as plain text');
 const snapshotBefore=JSON.stringify(exportSnapshot());SOONRE_ANALYTICS.render();check(JSON.stringify(exportSnapshot())===snapshotBefore,'Viewing analyses never modifies hotel business data');
 db.hotelId='other-hotel';SOONRE_ANALYTICS.render();check(document.getElementById('analysisResults').hidden&&document.getElementById('analysisHotel').textContent==='','Blocks stale data after hotel switch before new data loads');db.hotelId='hotel-test';
 showPage('chambres');db.currentUser.role='Accueil / Réception';filtrerMenuParRole();showPage('analyses');check(!document.getElementById('page-analyses').classList.contains('active')&&document.querySelector('[data-page="analyses"]').style.display==='none','Restricts consolidated financial analyses to management');
 db.currentUser.role='Gérant';db.currentUser.actif=false;showPage('analyses');check(!document.getElementById('page-analyses').classList.contains('active'),'Inactive managers cannot open analyses');
 return checks;
})()`);console.log(results.map(x=>'PASS '+x).join('\n'));assert.deepEqual(errors,[]);dom.window.close();})().catch(e=>{console.error(e);process.exit(1)});
