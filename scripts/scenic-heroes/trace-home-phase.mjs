import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.SCENIC_BASE_URL||'http://127.0.0.1:3125';
const b=await chromium.launch({executablePath:'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:process.env.SCENIC_HEADED!=='1',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={base,traces:[]};
try {
 for(const mode of ['static','webgl']) {
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  if(mode==='static')await p.addInitScript(()=>Object.defineProperty(window,'WebGL2RenderingContext',{value:undefined}));
  await p.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
  await p.goto(base,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.documentElement.dataset.phaseTransitionReady==='true');
  await p.waitForFunction(()=>document.querySelector('.parallax-scene-shell[data-webgl-ready="true"], .parallax-scene-shell[data-renderer="static"]'));
  await p.waitForTimeout(1000);
  for(const target of ['noon','sunset','night','morning']) {
   const trace=await p.evaluate(async()=>{
    const root=document.documentElement;const phases=['morning','noon','sunset','night'];const next=phases[(phases.indexOf(root.dataset.cockpitPhase)+1)%4];const sky=document.querySelector(`[data-sky-phase="${next}"]`);
    const color=()=>getComputedStyle(sky).opacity;
    const result={before:color(),events:[],frames:[],mutations:[]};let changed=0;
    const onEvent=e=>{if(e.target===sky)result.events.push({t:performance.now(),type:e.type,property:e.propertyName});};
    ['transitionrun','transitionstart','transitionend','transitioncancel'].forEach(e=>sky.addEventListener(e,onEvent));
    const mo=new MutationObserver(records=>{for(const r of records){const t=performance.now();result.mutations.push({t,attribute:r.attributeName,value:r.target.getAttribute(r.attributeName)});if(r.target===sky&&!changed&&r.target.style.opacity==='1')changed=t;}});
    mo.observe(sky,{attributes:true,attributeFilter:['style']});mo.observe(root,{attributes:true,attributeFilter:['data-cockpit-phase','data-phase-transition-ready','data-phase-transition-suspended']});
    result.click=performance.now();document.querySelector('[data-testid="daynight-toggle"]').click();
    await new Promise(resolve=>{function frame(t){result.frames.push({t,color:color(),phase:root.dataset.cockpitPhase,duration:getComputedStyle(sky).transitionDuration});if((changed&&t-changed>1300)||t-result.click>6000)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);});
    mo.disconnect();['transitionrun','transitionstart','transitionend','transitioncancel'].forEach(e=>sky.removeEventListener(e,onEvent));
    result.after=color();result.changed=changed;result.planes=[...document.querySelectorAll('.parallax-static-sky')].map(n=>({phase:n.dataset.skyPhase,opacity:getComputedStyle(n).opacity,promotion:n.style.willChange}));result.finalPhase=root.dataset.cockpitPhase;return result;
   });
   const values=trace.frames.filter(f=>f.t>=trace.changed);
   const gaps=values.slice(1).map((f,i)=>f.t-values[i].t).sort((a,b)=>a-b);
   trace.stats={intermediate:values.filter(f=>f.color!==trace.before&&f.color!==trace.after).length,commitLatency:trace.changed-trace.click,p95:gaps[Math.floor(gaps.length*.95)],max:Math.max(...gaps)};
   trace.text=await p.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const c=canvas.getContext('2d');
    const rgb=value=>{c.clearRect(0,0,1,1);c.fillStyle=value;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data];};
    const luminance=values=>values.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
    const buttons=[...document.querySelectorAll('.hero-copy .btn')].map(n=>{const s=getComputedStyle(n),fill=rgb(s.color),background=rgb(s.backgroundColor);return{text:n.textContent,fill,background,contrast:contrast(fill,background)};});
    const s=getComputedStyle(document.querySelector('.hero .lede'));
    return{buttons,caption:{fill:s.color,stroke:s.webkitTextStrokeColor,width:s.webkitTextStrokeWidth,contrast:contrast(rgb(s.color),rgb(s.webkitTextStrokeColor))}};
   });
   report.traces.push({mode,target,...trace});
   await p.screenshot({path:`validation/hero-time-transition-2026-09-06/home-${mode}-${target}-end.png`});
   assert.equal(trace.finalPhase,target);assert.equal(trace.planes.filter(p=>p.opacity==='1').length,1);assert.ok(trace.planes.every(p=>p.promotion==='auto'));assert.ok(trace.stats.intermediate>=3,`${mode}/${target}: intermediate frames`);
   assert.ok(trace.text.buttons.every(button=>button.background[3]===255&&button.contrast>=4.5),`${mode}/${target}: CTA contrast`);
   assert.ok(trace.text.caption.contrast>=4.5&&parseFloat(trace.text.caption.width)>=2,`${mode}/${target}: caption contour contrast`);
   if(mode==='static')assert.ok(trace.stats.max<100,`${mode}/${target}: frame starvation`);
  }
  const reversal = await p.evaluate(async () => {
   const planes = [...document.querySelectorAll('[data-sky-phase]')];
   const samples = []; let done = false;
   const sample = () => {
    const opacity = planes.map(n => Number(getComputedStyle(n).opacity));
    samples.push({ opacity, coverage: 1 - opacity.reduce((gap, value) => gap * (1 - value), 1) });
    if (!done) requestAnimationFrame(sample);
   };
   requestAnimationFrame(sample);
   for (let i = 0; i < 4; i++) {
    document.querySelector('[data-testid="daynight-toggle"]').click();
    await new Promise(resolve => setTimeout(resolve, 110));
   }
   await new Promise(resolve => setTimeout(resolve, 1100)); done = true;
   return { samples, phase: document.documentElement.dataset.cockpitPhase,
    stable: planes.every(n => n.isConnected),
    settled: planes.map(n => ({ phase: n.dataset.skyPhase, opacity: getComputedStyle(n).opacity, promotion: n.style.willChange })) };
  });
  assert.equal(reversal.phase, 'morning');
  assert.ok(reversal.stable && reversal.samples.every(s => s.coverage >= .9999), `${mode}: no fallback sky during rapid reversal`);
  assert.ok(reversal.settled.every(n => n.opacity === (n.phase === 'morning' ? '1' : '0') && n.promotion === 'auto'), `${mode}: reversal releases temporary planes`);
  report.traces.push({ mode, target: 'rapid reversal', reversal });
  await p.close();
 }
 report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;throw e;}finally{await b.close();await writeFile(`validation/hero-time-transition-2026-09-06/home-trace${process.env.SCENIC_HEADED==='1'?'-headed':''}.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({status:report.status,traces:report.traces.map(({mode,target,stats})=>({mode,target,...stats}))},null,2));
