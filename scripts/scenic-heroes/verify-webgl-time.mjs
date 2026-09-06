import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base=process.env.SCENIC_DIAGNOSTIC_URL||'http://127.0.0.1:3123';
const browser=await chromium.launch({executablePath:'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={base,conditions:'Development-only material/frame probes; appearance/performance screenshots use a separate production build.',checks:[],phases:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
 await page.goto(`${base}/?hero-probe=frames`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.cloudColor);
 const read=()=>page.locator('canvas').evaluate(n=>({...n.dataset}));
 for(const phase of ['noon','sunset','night','morning']) {
  const before=await read(); await page.getByTestId('daynight-toggle').click();await page.waitForTimeout(180);const middle=await read();await page.waitForTimeout(1200);const after=await read();
  check(`${phase}: material transition settles`,after.phaseInterpolating==='false');
  check(`${phase}: haze is intermediate`,middle.cloudColor!==before.cloudColor&&middle.cloudColor!==after.cloudColor);
  if(phase==='night'||phase==='morning') {
   check(`${phase}: terrain is intermediate`,middle.hillsColor!==before.hillsColor&&middle.hillsColor!==after.hillsColor);
   check(`${phase}: wash is intermediate`,middle.washOpacity!==before.washOpacity&&middle.washOpacity!==after.washOpacity);
  }
  report.phases.push({phase,before,middle,after});
 }
 await page.getByTestId('daynight-toggle').click();await page.waitForTimeout(70);await page.getByTestId('daynight-toggle').click();await page.waitForTimeout(70);await page.getByTestId('daynight-toggle').click();await page.waitForTimeout(1200);
 check('rapid retarget settles latest night',await page.getByTestId('daynight-toggle').getAttribute('data-phase')==='night'&&(await read()).phaseInterpolating==='false');
 await page.getByTestId('open-palette').click();await page.waitForTimeout(250);const paused=await read();await page.waitForTimeout(350);check('overlay stops WebGL frames',(await read()).heroFrameCount===paused.heroFrameCount);
 await page.keyboard.press('Escape');await page.waitForTimeout(300);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForTimeout(150);const hidden=await read();await page.waitForTimeout(250);check('visibility handler stops frames',(await read()).heroFrameCount===hidden.heroFrameCount);
 await page.close();report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;throw e;}
finally{await browser.close();await writeFile('validation/hero-time-transition-2026-09-06/webgl-report.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify({status:report.status,checks:report.checks.length}));
