import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const route=process.argv[2]||'about';
const base=process.env.SCENIC_BASE_URL||'http://127.0.0.1:3125';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH||'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const samples=[];
try {
 for(const width of [1440,375]) for(let run=1;run<=3;run++) {
  const context=await browser.newContext({viewport:{width,height:width===375?1000:1000}});
  await context.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
  const page=await context.newPage();
  await page.addInitScript(()=>{
   window.__scenicMetrics={cls:0,lcp:0,longTasks:[]};
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__scenicMetrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__scenicMetrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__scenicMetrics.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
  });
  await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});
  await page.locator('[data-scene] img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
  const observationStart=await page.evaluate(()=>performance.now());
  await page.waitForTimeout(1800);
  const result=await page.evaluate(()=>({...window.__scenicMetrics,images:performance.getEntriesByType('resource').filter(e=>e.name.includes('/scenic-heroes/')).map(e=>({url:e.name,bytes:e.encodedBodySize})),animations:document.querySelector('[data-scene]').getAnimations({subtree:true}).length,nav:performance.getEntriesByType('navigation')[0].toJSON()}));
  result.idleLongTasks=result.longTasks.filter(t=>t.start>=observationStart);
  result.imageBytes=result.images.reduce((s,i)=>s+i.bytes,0);
  assert.ok(result.cls<.05,`CLS ${result.cls}`);
  assert.ok(result.imageBytes<=(width===375?750000:1500000),'Image budget exceeded');
  assert.ok(result.images.length<=8,'Request budget exceeded');
  samples.push({width,run,...result}); await context.close();
 }
} finally {await browser.close();}
await writeFile(`validation/biome-heroes-2026-09-06/${route}/performance.json`,JSON.stringify({base,conditions:'Local production build, fresh browser contexts, no network/CPU throttling; analytics blocked. Whole-page metrics include existing shell and backend latency.',samples},null,2));
console.log(JSON.stringify(samples.map(({width,run,cls,lcp,imageBytes,animations,idleLongTasks})=>({width,run,cls,lcp,imageBytes,animations,idleLongTasks})),null,2));
