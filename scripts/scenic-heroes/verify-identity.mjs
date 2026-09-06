import {chromium} from 'playwright-core';import {writeFile,mkdir} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const results=[];const out='validation/biome-heroes-2026-09-06/identity';await mkdir(out,{recursive:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
for(const route of ['','about','projects','research','blog','contact','lore']) {
 await page.goto(`http://127.0.0.1:3123/${route}`,{waitUntil:'networkidle'});
 const result=await page.evaluate(()=>({path:location.pathname,title:document.title,description:document.querySelector('meta[name="description"]')?.content,text:document.body.innerText,h1:document.querySelector('h1')?.textContent}));
 assert.ok(!/Mukhtada\s+(?:Billah|Nasution)/i.test(result.text+result.title+result.description),`Full name remains on ${route}`);
 delete result.text;results.push(result);
 if(['','about','lore'].includes(route))await page.screenshot({path:`${out}/${route||'home'}-desktop.png`});
}
await page.goto('http://127.0.0.1:3123/blog',{waitUntil:'networkidle'});
const href=await page.locator('main a[href^="/blog/"]').first().getAttribute('href');
if(href){await page.goto(`http://127.0.0.1:3123${href}`,{waitUntil:'networkidle'});const text=await page.locator('main').innerText();assert.ok(!/By Mukhtada\s+(?:Billah|Nasution)/i.test(text));results.push({path:href,bylineShort:true});}
await writeFile(`${out}/report.json`,JSON.stringify({status:'passed',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
