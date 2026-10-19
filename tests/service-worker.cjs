const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const handlers={},stored=new Map(),deleted=[],waits=[];let downloaded=[],offline=false;
 const scope='https://soonre.test/Hotel-SOONRE/';
 const cache={addAll:async assets=>{downloaded=assets;for(const asset of assets)stored.set(new URL(asset,scope).href,new Response('cached'));},put:async(key,value)=>stored.set(key,value)};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../service-worker.js'),'utf8'),{URL,Response,self:{location:{origin:'https://soonre.test'},registration:{scope},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,match:async key=>stored.get(key)?.clone(),keys:async()=>['unrelated-cache','hotel-soonre-security-v8','hotel-soonre-security-v9'],delete:async key=>deleted.push(key)},fetch:async()=>{if(offline)throw Error('Offline');return new Response('fresh');}});
 let promise;handlers.install({waitUntil:p=>promise=p});await promise;assert(downloaded.every(p=>p.startsWith('./')&&!p.includes('supabase.co')));console.log('PASS Precaches static assets only');
 handlers.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(deleted,['hotel-soonre-security-v8']);console.log('PASS Preserves unrelated caches on upgrade');
 async function request(url,method='GET'){let response;handlers.fetch({request:{url,method},respondWith:p=>response=p,waitUntil:p=>waits.push(p)});return response?await response:null;}
 for(const[url,method]of [[scope+'rest/v1/factures','GET'],['https://project.supabase.co/rest/v1/clients','GET'],[scope+'app.js','POST'],['https://other.test/app.js','GET']])assert.equal(await request(url,method),null);console.log('PASS Never intercepts backend, cross-origin or write requests');
 assert.equal(await(await request(scope)).text(),'fresh');await Promise.all(waits);offline=true;assert.equal(await(await request(scope)).text(),'fresh');console.log('PASS Root navigation uses cached index when offline');
 assert.equal(await(await request(scope+'app.js?v=test')).text(),'cached');console.log('PASS Static cache lookup ignores version query parameters');
 stored.delete(scope+'app.js');assert.equal((await request(scope+'app.js')).status,503);console.log('PASS Missing offline asset returns an explicit failure');
})().catch(error=>{console.error(error);process.exit(1)});
