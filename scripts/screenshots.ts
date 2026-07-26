import { chromium, type Page } from 'playwright';import { mkdir } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';const out=new URL('../screenshots/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox','--disable-gpu']});
async function shot(name:string,target:string,viewport={width:1440,height:1050},action?:(p:Page)=>Promise<void>){const page=await browser.newPage({viewport,deviceScaleFactor:1});await page.goto(target,{waitUntil:'domcontentloaded',timeout:15000});await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(900);if(action)await action(page);await page.screenshot({path:new URL(name,out).pathname,fullPage:true});await page.close()}
await shot('01-landing-page.png',`${base}/`);
await shot('02-dashboard.png',`${base}/app.html?capture=dashboard#overview`);
await shot('03-report-incident.png',`${base}/app.html?capture=report#report`,undefined,async p=>{await p.click('#pasteDemo',{force:true});await p.waitForTimeout(350)});
await shot('04-my-cases.png',`${base}/app.html?capture=cases#cases`);
await shot('05-threat-registry.png',`${base}/app.html?capture=registry#registry`);
await shot('06-issuer-console.png',`${base}/app.html?capture=console#console`);
await shot('07-interactive-demo.png',`${base}/app.html?capture=demo#overview`,undefined,async p=>{await p.click('#watchDemo',{force:true});await p.waitForTimeout(350)});
await shot('08-landing-mobile.png',`${base}/`,{width:390,height:844});
await shot('09-dashboard-mobile.png',`${base}/app.html?capture=mobile#overview`,{width:390,height:844});
await browser.close();console.log('Created 9 Dollyeo screenshots');
