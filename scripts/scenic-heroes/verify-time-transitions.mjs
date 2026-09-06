import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.env.SCENIC_BASE_URL||'http://127.0.0.1:3125';
const out='validation/hero-time-transition-2026-09-06';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH||'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:process.env.SCENIC_HEADED!=='1',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={base,checks:[],errors:[],samples:[],frames:[]};
function check(name,value){assert.ok(value,name);report.checks.push(name);}
async function ready(page,route){
 await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.documentElement.dataset.phaseTransitionReady==='true');
 await page.locator(route==='about'?'[data-scene] img':'.parallax-initial-scene img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
 if(!route) await page.waitForFunction(()=>document.querySelector('.parallax-scene-shell[data-webgl-ready="true"], .parallax-scene-shell[data-renderer="static"]'));
 await page.waitForTimeout(1200);
}
const read=page=>page.evaluate(()=>{
 const hero=document.querySelector('[data-scene]');const sky=document.querySelector('.parallax-static-sky');const atm=document.querySelector('[data-atmosphere]');
 const style=n=>n?getComputedStyle(n):null;const root=hero||document.querySelector('.parallax-scene-shell');
 return {t:performance.now(),phase:document.documentElement.dataset.cockpitPhase,atmosphere:atm?[...atm.children].map(n=>({phase:n.dataset.atmospherePhase,color:style(n).backgroundColor,opacity:style(n).opacity})):null,sky:sky?[...document.querySelectorAll('.parallax-static-sky')].map(n=>[n.dataset.skyPhase,style(n).opacity]):null,main:style(document.querySelector('main')).backgroundColor,fadeColor:hero?style(document.querySelector('[data-scene-fade]')).getPropertyValue('--scene-page-color'):null,images:[...root.querySelectorAll('img')].map(n=>n.currentSrc),objects:root.querySelectorAll('[data-object], [data-static-celestial]').length,heroHeight:root.getBoundingClientRect().height};
});
try {
 for(const route of (process.env.SCENIC_ROUTES?.split(',')||['about',''])) for(const width of [1440,375]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  if(!route && width===1440) await page.addInitScript(()=>Object.defineProperty(window,'WebGL2RenderingContext',{value:undefined}));
  await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
  page.on('pageerror',e=>report.errors.push({route,width,message:e.message}));
  await ready(page,route);
  const label=route||'home';
  for(const target of ['noon','sunset','night','morning']) {
   const before=await read(page);
   await page.getByTestId('daynight-toggle').evaluate(n=>n.click());
   // Synchronize to the browser's displayed blend, not an external sleep whose
   // duration includes variable React scheduling and screenshot readback costs.
   await page.waitForFunction(phase=>{
    const n=document.querySelector(`[data-atmosphere-phase="${phase}"], [data-sky-phase="${phase}"]`);
    const opacity=n?Number(getComputedStyle(n).opacity):0;
    return opacity>.15&&opacity<.9;
   },target,{timeout:5000});
   const middle=await read(page);
   await page.screenshot({path:`${out}/${label}-${width}-${before.phase}-to-${target}-middle.png`});
   await page.waitForTimeout(1050);
   const after=await read(page);
   await page.screenshot({path:`${out}/${label}-${width}-${target}-end.png`});
   report.samples.push({label,width,before,middle,after});
   check(`${label}/${width}/${target}: latest phase`,after.phase===target);
   check(`${label}/${width}/${target}: stable images and objects`,JSON.stringify(before.images)===JSON.stringify(after.images)&&before.objects===after.objects);
   const visual=s=>JSON.stringify(s.atmosphere||s.sky);
   check(`${label}/${width}/${target}: real intermediate appearance`,visual(before)!==visual(middle)&&visual(middle)!==visual(after));
   if(route==='about') check(`${width}/${target}: fade inherits current page fill`,after.main===after.fadeColor.trim());
  }
  // Native transitions must retarget their displayed value; no queued old phase.
  for(let i=0;i<3;i++){await page.getByTestId('daynight-toggle').evaluate(n=>n.click());await page.waitForTimeout(90);}
  await page.waitForTimeout(1050);
  check(`${label}/${width}: rapid retarget settles`,(await read(page)).phase==='night');
  await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(180);
  check(`${label}/${width}: saved target restored`,(await read(page)).phase==='night');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByTestId('daynight-toggle').evaluate(n=>n.click());await page.waitForTimeout(80);
  const reduced=await read(page);
  check(`${label}/${width}: reduced target immediate`,reduced.phase==='morning');
  check(`${label}/${width}: reduced zero phase duration`,await page.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--phase-visual-duration'))===0));
  await page.screenshot({path:`${out}/${label}-${width}-reduced.png`});
  await page.close();
 }
 // Frame timing is collected separately: screenshot readback would contaminate it.
 for(const width of [1440,375]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());await ready(page,'about');
  for(const target of ['noon','sunset','night','morning']) {
   const sample=await page.evaluate(async()=>{
    const root=document.querySelector('[data-scene]'),gaps=[],tasks=[];let previous=performance.now(),start=previous;
    const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));observer.observe({type:'longtask'});
    document.querySelector('[data-testid="daynight-toggle"]').click();
    await new Promise(resolve=>{function frame(now){gaps.push(now-previous);previous=now;if(now-start<1300)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});observer.disconnect();gaps.shift();gaps.sort((a,b)=>a-b);
    return {target:document.documentElement.dataset.cockpitPhase,p95:gaps[Math.floor(gaps.length*.95)],max:Math.max(...gaps),over34:gaps.filter(g=>g>34).length/gaps.length,frames:gaps.length,longTasks:tasks,largeFilters:[...root.querySelectorAll('*')].filter(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return s.filter!=='none'&&!s.filter.startsWith('blur(')&&r.width>innerWidth*.8&&r.height>innerHeight*.5;}).map(n=>n.className)};
   });
   report.frames.push({width,...sample});
   check(`About/${width}/${target}: no large scene filter`,sample.largeFilters.length===0);
   check(`About/${width}/${target}: frame p95 <= 34ms`,sample.p95<=34);
   check(`About/${width}/${target}: under 10% frame gaps over34ms`,sample.over34<.1);
  }
  // Instrument the actual element method, then dispatch a dense pointer sweep.
  const pointer=await page.evaluate(async()=>{
   const root=document.querySelector('[data-scene]');let reads=0;const original=root.getBoundingClientRect.bind(root);root.getBoundingClientRect=()=>{reads++;return original();};
   for(let i=0;i<120;i++)root.dispatchEvent(new PointerEvent('pointermove',{clientX:200+i*3,clientY:450}));
   await new Promise(r=>setTimeout(r,180));delete root.getBoundingClientRect;return {reads,x:root.style.getPropertyValue('--scene-pointer-x')};
  });
  check(`${width}: pointer burst performs no layout reads`,pointer.reads===0);
  await page.close();
 }
 // Existing ordinary pages retain the canonical phase after route navigation.
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 for(const route of ['research','blog','contact']) {
  await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});
  for(const phase of ['noon','sunset','night','morning']){await page.getByTestId('daynight-toggle').evaluate(n=>n.click());await page.waitForTimeout(1050);check(`${route} phase ${phase}`,await page.getByTestId('daynight-toggle').getAttribute('data-phase')===phase);await page.screenshot({path:`${out}/${route}-${phase}.png`});}
 }
 await page.close();
 check('no runtime errors',report.errors.length===0);report.status='passed';
} catch(error){report.status='failed';report.failure=error.message;throw error;}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
// Contact sheets are indexes of actual screenshots, never generated scene artwork.
for(const label of ['about','home']) for(const width of [1440,375]) {
 const paths=['noon','sunset','night','morning'].map(phase=>`${out}/${label}-${width}-${phase}-end.png`);
 const thumbs=await Promise.all(paths.map(path=>sharp(path).resize({width:width===375?300:576}).toBuffer()));
 const h=width===375?800:400,w=width===375?300:576;
 await sharp({create:{width:w*2,height:h*2,channels:3,background:'#ffffff'}}).composite(thumbs.map((input,i)=>({input,left:(i%2)*w,top:Math.floor(i/2)*h}))).png().toFile(`${out}/${label}-${width}-phases.png`);
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,frames:report.frames.map(({width,target,p95,over34})=>({width,target,p95,over34}))},null,2));
