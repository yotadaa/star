import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const route = process.argv[2] || 'about';
const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3123';
const out = `validation/biome-heroes-2026-09-06/${route}`;
await mkdir(out, { recursive:true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless:true, args:['--no-sandbox'] });
const report = { route, base, errors:[], viewports:[], phases:[], checks:[] };
const check = (name, condition) => { assert.ok(condition,name); report.checks.push(name); };
const context = await browser.newContext({viewport:{width:1440,height:1000}});
await context.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
const page = await context.newPage();
page.on('pageerror',error=>report.errors.push(error.message));
const ready = async () => {
 await page.locator('[data-scene]').waitFor();
 await page.locator('[data-scene] img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
 await page.waitForFunction(()=>document.querySelector('[data-scene]')?.dataset.motion==='running');
};
try {
 for(const width of [1440,768,375]) {
  await page.setViewportSize({width,height:width===375?1100:1000});
  await page.goto(`${base}/${route}`,{waitUntil:'networkidle'}); await ready();
  const facts=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,h1:[...document.querySelectorAll('h1')].map(n=>n.textContent),title:document.title,images:[...document.querySelectorAll('[data-scene] img')].map(i=>({src:i.currentSrc,width:i.naturalWidth,loaded:i.complete&&i.naturalWidth>0})),targets:[...document.querySelectorAll('[data-scene] button')].map(n=>({label:n.getAttribute('aria-label')||n.textContent,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))}));
  check(`${width}: no overflow`,facts.documentWidth<=width);
  check(`${width}: one h1`,facts.h1.length===1);
  check(`${width}: all assets loaded`,facts.images.every(i=>i.loaded));
  check(`${width}: only this route assets`,facts.images.every(i=>i.src.includes(`/scenic-heroes/${route}/`)));
  check(`${width}: 44px targets`,facts.targets.every(t=>t.w>=43.9&&t.h>=43.9));
  report.viewports.push(facts);
  await page.screenshot({path:`${out}/${width}-default.png`});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`${base}/${route}`,{waitUntil:'networkidle'}); await ready();
 const hero=page.locator('[data-scene]');
 if(route==='about') {
  for(const depth of ['Near','Middle','Far']) {
   const button=hero.getByRole('button',{name:depth,exact:true});
   await button.focus(); await page.keyboard.press('Enter');
   await page.waitForTimeout(720);
   check(`focus ${depth}`,await hero.getAttribute('data-focus')===depth.toLowerCase());
   check(`sharp selected ${depth}`,await hero.locator(`[data-depth="${depth.toLowerCase()}"] img`).evaluateAll(imgs=>imgs.every(i=>getComputedStyle(i).filter==='blur(0px)')));
   check(`sharp copy ${depth}`,await hero.locator('h1').evaluate(n=>getComputedStyle(n).filter==='none'));
   await page.screenshot({path:`${out}/desktop-focus-${depth.toLowerCase()}.png`});
  }
  await hero.getByRole('button',{name:'Middle',exact:true}).click();
  await hero.getByRole('button',{name:'Observe the bird',exact:true}).focus();
  const before=await hero.getByRole('button',{name:'Observe the bird',exact:true}).boundingBox();
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  const after=await hero.getByRole('button',{name:'Observe the bird',exact:true}).boundingBox();
  check('stationary bird target',Math.abs(before.x-after.x)<1&&Math.abs(before.y-after.y)<1);
  await page.screenshot({path:`${out}/desktop-triggered.png`});
 }
 // Route-specific behavior checks are registered alongside their scene.
 const interactables={projects:{id:'compass',stages:3},research:{id:'signal',stages:1},blog:{id:'lantern',stages:1},contact:{id:'school-call',stages:1}};
 if(interactables[route]) {
  const {id,stages}=interactables[route];
  for(let step=1;step<=stages;step++) {
   await hero.locator(`[data-object="${id}"] button`).focus(); await page.keyboard.press('Enter');
   await page.waitForTimeout(500);
   await page.screenshot({path:`${out}/desktop-stage-${step}.png`});
  }
  check('completed scene action',await hero.locator(`[data-object="${id}"]`).getAttribute('data-active')==='true');
  await hero.locator(`[data-object="${id}"] button`).click();
 }
 await hero.getByRole('button',{name:/Journal/}).click();
 check('one discovery recorded',await hero.getByRole('button',{name:/Journal/}).textContent().then(t=>t.includes('1/5')));
 await page.keyboard.press('Escape');
 check('journal Escape closes and restores focus',await hero.getByRole('button',{name:/Journal/}).evaluate(n=>document.activeElement===n&&n.getAttribute('aria-expanded')==='false'));
 await hero.getByRole('button',{name:'Pause ambient motion'}).click();
 check('manual pause',await hero.getAttribute('data-motion')==='paused');
 check('no running hero animation on pause',await hero.evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState!=='running')));
 await hero.getByRole('button',{name:'Resume ambient motion'}).click();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('[data-scene]').dataset.motion==='reduced');
 check('reduced motion has zero running animations',await hero.evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState!=='running')));
 await page.screenshot({path:`${out}/desktop-reduced-motion.png`});
 await page.emulateMedia({reducedMotion:'no-preference'}); await ready();
 for(const overlay of [
  {open:'open-palette',panel:'command-palette',close:()=>page.keyboard.press('Escape')},
  {open:'open-player-status',panel:'player-status-popup',close:()=>page.getByRole('button',{name:'Close Player Status',exact:true}).click()},
  {open:'open-world-chat',panel:'world-chat-panel',close:()=>page.getByTestId('world-chat-panel').getByRole('button',{name:'Close',exact:true}).click()},
 ]) {
  await page.getByTestId(overlay.open).click(); await page.getByTestId(overlay.panel).waitFor();
  await page.waitForFunction(()=>document.querySelector('[data-scene]').dataset.motion==='paused');
  check(`overlay ${overlay.panel} pauses`,await hero.evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState!=='running')));
  await overlay.close(); await ready();
 }
 await page.evaluate(()=>window.scrollTo(0,document.querySelector('[data-scene]').getBoundingClientRect().height+200));
 await page.waitForFunction(()=>document.querySelector('[data-scene]').dataset.motion==='paused');
 check('offscreen paused',await hero.getAttribute('data-motion')==='paused');
 await page.evaluate(()=>window.scrollTo(0,0)); await ready();
 // A synthetic visibility event exercises the handler; this is not OS tab suspension.
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 check('hidden page paused',await hero.getAttribute('data-motion')==='paused');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));}); await ready();
 for(const phase of ['morning','noon','sunset','night','morning']) {
  const previousPhase=await page.getByTestId('daynight-toggle').getAttribute('data-phase');
  for(let i=0;i<4&&await page.getByTestId('daynight-toggle').getAttribute('data-phase')!==phase;i++) await page.getByTestId('daynight-toggle').click();
  await page.waitForFunction(p=>document.querySelector('[data-scene]').dataset.phase===p,phase);
  if(previousPhase!==phase) {
   await page.waitForFunction(p=>{const node=document.querySelector(`[data-atmosphere-phase="${p}"]`);const opacity=Number(getComputedStyle(node).opacity);return opacity>.05&&opacity<.95;},phase);
   check(`${phase}: real intermediate atmosphere`,true);
   await page.screenshot({path:`${out}/desktop-${phase}-transition.png`});
  }
  await page.waitForTimeout(1050);
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('[data-scene]').offsetHeight-600));
  await page.waitForTimeout(150);
  const edge=await hero.evaluate(n=>n.getBoundingClientRect().bottom);
  const png=await page.screenshot({path:`${out}/desktop-${phase}-fade.png`});
  const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const pixel=y=>[...data.subarray((Math.round(y)*info.width+Math.floor(info.width*.03))*3,(Math.round(y)*info.width+Math.floor(info.width*.03))*3+3)];
  const above=pixel(edge-3),below=pixel(edge+3);
  check(`${phase}: seamless edge`,above.every((v,i)=>Math.abs(v-below[i])<=2));
  report.phases.push({phase,edge,above,below});
 }
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.reload({waitUntil:'networkidle'}); await ready();
 check('discovery persists on reload',await hero.getByRole('button',{name:/Journal/}).textContent().then(t=>t.includes('1/5')));
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:1000}});
 const staticPage=await nojs.newPage(); await staticPage.goto(`${base}/${route}`,{waitUntil:'load'});
 check('SSR content and navigation without JS',await staticPage.locator('h1').count()===1&&await staticPage.locator(`a[href="#${route}-content"]`).count()===1);
 await nojs.close();
 const blocked=await browser.newContext();
 await blocked.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get:()=>{throw new DOMException('Blocked','SecurityError');}});});
 const fallback=await blocked.newPage(); const storageErrors=[];fallback.on('pageerror',e=>storageErrors.push(e.message));
 await fallback.goto(`${base}/${route}`,{waitUntil:'networkidle'});
 check('blocked session storage safe',storageErrors.length===0);
 await blocked.close();
 check('no runtime errors',report.errors.length===0);
 report.status='passed';
} catch(error) {report.status='failed';report.failure=error.message;throw error;}
finally {await writeFile(`${out}/browser-report.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({route,status:report.status,checks:report.checks.length}));
