const fs=require('fs'),path=require('path'),assert=require('assert');const{JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
class Loader extends ResourceLoader{fetch(url){if(url.includes('chart'))return Promise.resolve(Buffer.from('window.Chart=class{constructor(){this.destroy=()=>{}}};'));if(url.includes('supabase.js'))return Promise.resolve(Buffer.from('window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),signOut:async()=>({error:null})}})};'));if(url.startsWith('https://soonre.test/')){const file=path.join(root,new URL(url).pathname);return Promise.resolve(fs.readFileSync(file));}return Promise.resolve(Buffer.from(''));}}
(async()=>{const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://soonre.test/index.html',runScripts:'dangerously',resources:new Loader(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.confirm=()=>true;}});await new Promise(r=>dom.window.addEventListener('load',r));await new Promise(r=>setTimeout(r,300));assert.deepEqual(errors,[],'Startup errors');
const results=await dom.window.eval(`(()=>{
 const checks=[];function check(value,name){if(!value)throw Error(name);checks.push(name);}
 db.currentUser={id:'experience-test',role:'Directeur Général',actif:true};db.hotelId='test';
 const motion=document.getElementById('experienceMotion');check(motion&&!motion.checked,'Desktop transitions are off by default');motion.checked=true;motion.onchange();check(JSON.parse(localStorage.getItem('soonre-appearance-v1')).smoothMotion===true,'Optional transitions persist as a browser preference');SOONRE_EXPERIENCE.setTheme('iris');check(JSON.parse(localStorage.getItem('soonre-appearance-v1')).smoothMotion===true,'Changing color preserves the motion choice');motion.checked=false;motion.onchange();
 const before=JSON.stringify(exportSnapshot());SOONRE_EXPERIENCE.setTheme('sage');
 check(document.documentElement.dataset.workspaceTheme==='sage','Changes visual theme immediately');
 check(JSON.parse(localStorage.getItem('soonre-appearance-v1')).theme==='sage','Stores only browser appearance preference');
 check(JSON.stringify(exportSnapshot())===before,'Changing theme never changes business collections');
 SOONRE_EXPERIENCE.setTheme('__proto__');check(SOONRE_EXPERIENCE.getTheme()==='sage','Rejects unknown appearance keys');
 showPage('parametres');switchParamTab('appearance');check(document.getElementById('param-general').style.display==='none'&&document.getElementById('param-appearance').style.display!=='none','Appearance is a real settings tab');
 switchParamTab('general');check(document.getElementById('param-appearance').style.display==='none','Leaving appearance restores normal settings view');
 SOONRE_EXPERIENCE.openSearch();let input=document.getElementById('experienceQuery');input.value='reservation';input.oninput();check(document.getElementById('experienceResults').textContent.includes('réservation'),'Command search ignores accents');
 input.value='<img src=x onerror=alert(1)>';input.oninput();check(!document.getElementById('experienceResults').querySelector('img'),'Search input stays plain text');
 closeModal();document.querySelector('.nav-item[data-page="paie"]').style.display='none';SOONRE_EXPERIENCE.openSearch();input=document.getElementById('experienceQuery');input.value='paie';input.oninput();check(!document.querySelector('#experienceResults [role="option"]'),'Command search excludes hidden navigation');closeModal();
 check(!document.getElementById('modalBox').classList.contains('experience-command'),'Closing search cleans command dialog styling');
 db.currentUser.actif=false;SOONRE_EXPERIENCE.openSearch();check(!document.getElementById('modalOverlay').classList.contains('active'),'Inactive account cannot open navigation commands');
 return checks;
})()`);console.log(results.map(x=>'PASS '+x).join('\n'));assert.deepEqual(errors,[]);dom.window.close();})().catch(e=>{console.error(e);process.exit(1)});
