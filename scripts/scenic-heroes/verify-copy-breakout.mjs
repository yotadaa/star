import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.env.SCENIC_BASE_URL||'http://127.0.0.1:3125';
const out='validation/hero-time-transition-2026-09-06';
const report={base,checks:[],samples:[],errors:[]};
const check=(label,value)=>{assert.ok(value,label);report.checks.push(label);};
const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const b=await chromium.launch({executablePath:'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
const alpha=await sharp('public/scenic-heroes/about/branch.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
try {
 for(const route of ['about','projects'])for(const width of [1440,768,375]) {
  const p=await b.newPage({viewport:{width,height:1100}});p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(`${base}/${route}`,{waitUntil:'networkidle'});
  await p.locator('[data-scene] img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
  for(const phase of ['morning','noon','sunset','night']) {
   await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   for(let i=0;i<4&&await p.getByTestId('daynight-toggle').getAttribute('data-phase')!==phase;i++)await p.getByTestId('daynight-toggle').evaluate(n=>n.click());
   await p.waitForTimeout(1100);
   const sample=await p.locator('[data-scene]').evaluate(root=>{
    const rect=n=>n.getBoundingClientRect().toJSON();
    const copy=root.querySelector('header');
    const text=[...copy.querySelectorAll('h1,p')].map(n=>{const s=getComputedStyle(n);return {tag:n.tagName,fill:s.color,stroke:s.webkitTextStrokeColor,strokeWidth:s.webkitTextStrokeWidth,order:s.paintOrder,weight:s.fontWeight,size:s.fontSize,rect:rect(n),background:s.backgroundColor,image:s.backgroundImage};});
    const branch=root.querySelector('[data-object="near-branch"]');
    const button=branch?.querySelector('button');
    const image=branch?.querySelector('img');
    const foreground=root.querySelector('[data-scene-breakout]');
    return {hero:rect(root),width:document.documentElement.scrollWidth,copy:text,copyBackground:getComputedStyle(copy).backgroundColor,tone:copy.dataset.copyTone,scrims:root.querySelectorAll('[data-scene-copy-scrim]').length,
     branch:branch?{image:rect(image),button:rect(button),imageCount:branch.querySelectorAll('img[src*="branch.webp"]').length,buttonCount:branch.querySelectorAll('button').length,leafAttached:branch.querySelector('[data-object="near-leaves"]')!==null,clip:rect(foreground),clearance:rect(document.querySelector('[data-scene-clearance]')),content:rect(document.querySelector('#about-content')),filter:getComputedStyle(foreground).filter}:null};
   });
   report.pending={route,width,phase,sample};
   check(`${route}/${width}/${phase}: no horizontal overflow`,sample.width===width);
   check(`${route}/${width}/${phase}: no text backing`,sample.scrims===0&&sample.copyBackground==='rgba(0, 0, 0, 0)'&&sample.copy.every(t=>t.background==='rgba(0, 0, 0, 0)'&&t.image==='none'));
   sample.contrasts=sample.copy.map(t=>contrast(t.fill,t.stroke));
   check(`${route}/${width}/${phase}: outlined text contrast and fill order`,sample.contrasts.every(c=>c>=4.5)&&sample.copy.every(t=>parseFloat(t.strokeWidth)>=1.5&&t.order==='stroke'));
   check(`${route}/${width}/${phase}: caption at least17px and medium weight`,sample.copy.filter(t=>t.tag==='P').every(t=>parseFloat(t.size)>=17&&Number(t.weight)>=500));
   if(sample.branch) {
    const v=sample.branch,margin=12;
    check(`${width}/${phase}: one branch visual with attached leaves and target`,v.imageCount===1&&v.buttonCount===1&&v.leafAttached);
    check(`${width}/${phase}: branch target44px and inside frame`,v.button.width>=44&&v.button.height>=44&&v.button.left>=margin&&v.button.right<=width-margin&&v.button.bottom<=sample.hero.bottom-margin);
    const x=Math.floor((v.image.right-(v.button.x+v.button.width/2))/v.image.width*alpha.info.width);
    const y=Math.floor((v.image.bottom-(v.button.y+v.button.height/2))/v.image.height*alpha.info.height);
    sample.hitAlpha=alpha.data[(y*alpha.info.width+x)*4+3];
    check(`${width}/${phase}: hit target centered on opaque bark`,sample.hitAlpha>190);
    check(`${width}/${phase}: visible bounded overhang with clear content`,v.image.bottom>sample.hero.bottom+20&&v.image.bottom<v.clip.bottom&&v.content.top>=v.clip.bottom-1);
    check(`${width}/${phase}: no full-plane foreground filter`,v.filter==='none');
    const button=p.getByRole('button',{name:'Focus on nearby bark',exact:true});
    await button.click();
    check(`${width}/${phase}: branch click focuses Near`,await button.getAttribute('aria-pressed')==='true'&&await p.getByRole('button',{name:'Near',exact:true}).getAttribute('aria-pressed')==='true');
    await p.getByRole('button',{name:'Middle',exact:true}).click();
    await p.mouse.move(width*.9,200);await p.waitForTimeout(180);
    sample.focus=await button.evaluate(async n=>{const parent=n.closest('[data-scene-parallax]');const read=()=>({rect:n.getBoundingClientRect().toJSON(),transform:getComputedStyle(parent).transform,inline:parent.style.transform,scroll:scrollY,motion:document.querySelector('[data-scene]').dataset.motion});const initial=read();n.focus({preventScroll:true});const focused=read();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const final=read();return{before:initial.rect,after:final.rect,initial,focused,final};});
    await p.keyboard.press('Space');
    check(`${width}/${phase}: focus preserves branch position`,Math.abs(sample.focus.before.x-sample.focus.after.x)<1&&Math.abs(sample.focus.before.y+sample.focus.initial.scroll-sample.focus.after.y-sample.focus.final.scroll)<1&&sample.focus.focused.transform===sample.focus.final.transform);
    await p.getByRole('button',{name:'Middle',exact:true}).click();await p.waitForTimeout(700);
    const free=await p.evaluate(()=>{const hero=document.querySelector('[data-scene]').getBoundingClientRect();return !document.elementFromPoint(innerWidth*.5,hero.bottom+15)?.closest('[data-object]');});
    check(`${width}/${phase}: overhang has no interactive hit target`,free);
   }
   await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(180);
   await p.screenshot({path:`${out}/${route}-${width}-${phase}-copy-breakout.png`});
   report.samples.push({route,width,phase,...sample});
  }
  await p.close();
 }
 check('no runtime errors',report.errors.length===0);delete report.pending;report.status='passed';
}catch(error){report.status='failed';report.failure=error.message;throw error;}
finally{await writeFile(`${out}/copy-breakout-report.json`,JSON.stringify(report,null,2));await b.close();}
console.log(JSON.stringify({status:report.status,checks:report.checks.length}));
