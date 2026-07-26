import { chromium, type Page } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4188';
const browser=await chromium.launch({headless:true,executablePath:'/usr/local/bin/chromium',args:['--no-sandbox','--disable-gpu']});
const errors:string[]=[];
function monitor(page:Page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})}
async function open(target:string){const page=await browser.newPage({viewport:{width:1440,height:1000}});monitor(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(target,{waitUntil:'domcontentloaded',timeout:15000});await page.waitForTimeout(450);return page}
const routes:Array<[string,string]>=[['landing',`${base}/`],['overview',`${base}/app.html?qa=overview#overview`],['report',`${base}/app.html?qa=report#report`],['cases',`${base}/app.html?qa=cases#cases`],['registry',`${base}/app.html?qa=registry#registry`],['console',`${base}/app.html?qa=console#console`]];
for(const [name,url] of routes){const page=await open(url);const audit=await page.$$eval('i.hgi',els=>els.map((el:any)=>{const p=getComputedStyle(el,'::before').content;return{cls:el.className,svg:!!el.querySelector('svg'),pseudo:!!p&&!['none','normal','""'].includes(p)}}));const broken=audit.filter(x=>!x.svg&&!x.pseudo);if(broken.length)throw new Error(`${name} broken icons: ${JSON.stringify(broken)}`);await page.close()}
const demo=await open(`${base}/app.html?qa=demo#overview`);await demo.click('#watchDemo',{force:true});await demo.click('#runDemo',{force:true});await demo.waitForTimeout(1100);await demo.close();
const report=await open(`${base}/app.html?qa=submit#report`);await report.click('#pasteDemo',{force:true});await report.click('#incidentForm button[type=submit]',{force:true});await report.waitForTimeout(500);await report.close();
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);console.log('Final QA passed: every icon rendered, interactions healthy, zero browser errors');await browser.close();
