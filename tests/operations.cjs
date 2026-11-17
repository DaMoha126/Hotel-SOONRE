const fs=require('fs'),path=require('path'),assert=require('assert');const{JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
class Loader extends ResourceLoader{fetch(url){if(url.includes('chart'))return Promise.resolve(Buffer.from('window.Chart=class{constructor(){this.destroy=()=>{}}};'));if(url.includes('supabase.js'))return Promise.resolve(Buffer.from('window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),signOut:async()=>({error:null})}})};'));if(url.startsWith('https://soonre.test/')){const file=path.join(root,new URL(url).pathname);return Promise.resolve(fs.readFileSync(file));}return Promise.resolve(Buffer.from(''));}}
(async()=>{const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://soonre.test/index.html',runScripts:'dangerously',resources:new Loader(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.confirm=()=>true;}});await new Promise(r=>dom.window.addEventListener('load',r));await new Promise(r=>setTimeout(r,300));assert.deepEqual(errors,[],'Startup errors');
const out=await dom.window.eval(`(async()=>{
 const result=[];const check=(ok,name)=>{if(!ok)throw Error(name);result.push(name);};
 db.currentUser={id:'u',nom:'Direction',role:'Directeur Général',actif:true};db.hotelId='11111111-1111-4111-8111-111111111111';cloudReady=true;recoveryBlocked=false;window.hotelSyncPending=false;
 check(window.SOONRE_CAPABILITIES===window.soonreCapabilities,'Uses one shared capability map');
 let blocked=0;for(const value of [{format:'soonre-business-backup',formatVersion:3,hotelId:'other',tables:{clients:[]}},{format:'soonre-business-backup',formatVersion:999,hotelId:db.hotelId,tables:{clients:[]}},{users:[]},{clients:[{id:'duplicate'},{id:'duplicate'}]}])try{SOONRE_BACKUPS.parse(value)}catch{blocked++;}
 check(blocked===4,'Rejects wrong-hotel, wrong-version and unsafe backup files');
 db.clients=[{id:'c',nom:'Original',prenom:'Client'}];db.chambres=[{id:'r',numero:'1',type:'Standard',prix:100,capacite:1,statut:'libre',etatMenage:'propre'}];db.reservations=[];
 cloudBaseline.clear();baselineVersions.clear();for(const[k,row]of snapshotRows()){cloudBaseline.set(k,JSON.stringify(row.data));baselineVersions.set(k,1);}
 const plan=SOONRE_BACKUPS.changes({clients:[{id:'c',nom:'Updated',prenom:'Client'}]});check(plan.changed===1&&db.clients[0].nom==='Original','Import preview never changes local business records');
 soonreCapabilities.housekeeping=true;const c=chambreFromDb({id:'r',hotel_id:db.hotelId,numero:'1',prix:100,statut:'libre',etat_menage:'a_nettoyer'});check(c.etatMenage==='a_nettoyer'&&!Object.hasOwn(chambreToDb(c),'etat_menage'),'Housekeeping is read from server and excluded from generic writes');
 const order=commandeFromDb({id:'o',ref_resa:'stay',facture_sejour_id:'invoice'});check(order.refResa==='stay'&&order.factureSejourId==='invoice','Restores explicit stay billing links');
 db.factures=[{id:'f',numero:'F',total:100,paye:0,lignes:[],statut:'impaye'}];db.sessionsCaisse=[{id:'cash',statut:'ouverte'}];soonreCapabilities.billing_split=true;
 let calls=[];queueCloudSync=async()=>{};callServerRPC=async(name,args)=>{calls.push({name,args});return {error:{message:'Response lost'}};};
 payerFacture('f');check(!!document.getElementById('stayPaymentForm'),'Split payment modal opens');
 const form=document.getElementById('stayPaymentForm');const first=document.querySelector('#stayPaymentRows input');first.value='-1';first.dispatchEvent(new Event('input'));await form.onsubmit({preventDefault(){}});check(calls.length===0,'Rejects negative split payment before server call');
 first.value='100';first.dispatchEvent(new Event('input'));const promise=form.onsubmit({preventDefault(){}});await form.onsubmit({preventDefault(){}});await promise;check(calls.length===1,'Blocks repeated payment submission while pending');
 const operation=calls[0].args.p_operation;check(operation&&db.factures[0].paye===0,'Persists payment operation without inventing local settlement');
 await form.onsubmit({preventDefault(){}});check(calls.length===2&&calls[1].args.p_operation===operation,'Reuses same payment identifier after lost response');
 closeModal();db.currentUser.role='Ménage';payerFacture('f');check(!document.getElementById('modalOverlay').classList.contains('active'),'Cleaning role cannot open financial payment');
 db.currentUser.role='Gérant';closeModal();
 const originalFrom=sb.from,originalHotel=db.hotelId;let release,queried=[];
 sb.from=table=>{const q={select:()=>q,eq:(name,value)=>{queried.push([table,name,value]);return q;},single:()=>new Promise(resolve=>release=resolve)};return q;};
 const editJob=editUser('staff');db.hotelId='22222222-2222-4222-8222-222222222222';release({data:{id:'staff',nom:'Other',role:'Ménage',actif:true},error:null});await editJob;
 check(queried.some(x=>x[1]==='hotel_id'&&x[2]===originalHotel)&&!document.getElementById('modalOverlay').classList.contains('active'),'Drops stale employee response after hotel switch');
 db.hotelId=originalHotel;let waiting=[],readHotels=[],immediate=false;
 sb.from=table=>{const q={select:()=>q,eq:(name,value)=>{readHotels.push(value);return q;},order:()=>q,range:()=>immediate?Promise.resolve({data:[],error:null}):new Promise(resolve=>waiting.push(resolve))};return q;};
 const loadJob=loadCloudState({preserveLocalModules:false}).then(()=>false,()=>true);await Promise.resolve();await Promise.resolve();db.hotelId='22222222-2222-4222-8222-222222222222';immediate=true;waiting.forEach(resolve=>resolve({data:[],error:null}));
 check(await loadJob,'Rejects loading business data after hotel context changes');check(db.clients[0].nom==='Original'&&readHotels.every(id=>id===originalHotel),'Preserves existing data and captures hotel for every read');sb.from=originalFrom;db.hotelId=originalHotel;
 return result;
})()`)
;console.log(out.map(x=>'PASS '+x).join('\n'));assert.deepEqual(errors,[]);dom.window.close();})().catch(e=>{console.error(e);process.exit(1)});
