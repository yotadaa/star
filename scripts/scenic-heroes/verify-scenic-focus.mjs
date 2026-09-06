import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base=process.env.SCENIC_BASE_URL||'http://127.0.0.1:3123';
const b=await chromium.launch({executablePath:'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
const report={base,checks:[],samples:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
const l=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
try {
 for(const width of [1440,768,375]) {
  const p=await b.newPage({viewport:{width,height:1000}});await p.goto(`${base}/about`,{waitUntil:'networkidle'});
  for(const phase of ['morning','night']) {
   while(await p.getByTestId('daynight-toggle').getAttribute('data-phase')!==phase)await p.getByTestId('daynight-toggle').evaluate(n=>n.click());
   await p.waitForTimeout(1050);
   const bird=p.getByRole('button',{name:'Observe the bird',exact:true});await bird.focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);
   const sample=await p.locator('[data-scene-focus-ring]').evaluate(n=>{const s=getComputedStyle(n.firstChild);const ancestors=[];for(let a=n;a;a=a.parentElement)ancestors.push({opacity:getComputedStyle(a).opacity,filter:getComputedStyle(a).filter});return {color:s.color,background:s.backgroundColor,ancestors,duplicateOutline:getComputedStyle(document.activeElement).outlineStyle};});
   sample.contrast=(Math.max(l(sample.color),l(sample.background))+.05)/(Math.min(l(sample.color),l(sample.background))+.05);
   check(`${width}/${phase}: focus label AA`,sample.contrast>=4.5&&sample.ancestors.every(a=>a.opacity==='1'&&a.filter==='none'));
   check(`${width}/${phase}: one focus ring`,sample.duplicateOutline==='none');
   await p.screenshot({path:`validation/hero-time-transition-2026-09-06/about-${width}-${phase}-focus.png`});report.samples.push({width,phase,...sample});
  }
  await p.getByRole('button',{name:'Near',exact:true}).click();await p.waitForTimeout(750);await p.screenshot({path:`validation/hero-time-transition-2026-09-06/about-${width}-near-focus.png`});
  await p.getByRole('button',{name:'Pause ambient motion'}).click();
  check(`${width}: pause stops every scenic animation`,await p.locator('[data-scene]').evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState!=='running')));
  await p.close();
 }
 report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;throw e;}finally{await writeFile('validation/hero-time-transition-2026-09-06/focus-report.json',JSON.stringify(report,null,2));await b.close();}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,contrast:report.samples[0]?.contrast}));
