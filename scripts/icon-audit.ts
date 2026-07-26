import { chromium } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4186';
const browser=await chromium.launch({headless:true,executablePath:'/usr/local/bin/chromium',args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const all:any[]=[];
for(const path of ['','app.html#overview']){
  await page.goto(`${base}/${path}`,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const rows=await page.$$eval('i.hgi',nodes=>nodes.map((el:any)=>{const before=getComputedStyle(el,'::before');const own=getComputedStyle(el);return{page:location.pathname,cls:el.className,content:before.content,font:before.fontFamily,display:own.display,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}}));all.push(...rows)
}
const unique=[...new Map(all.map(x=>[x.cls,x])).values()];
const missing=unique.filter((x:any)=>!x.content||['none','normal','""'].includes(x.content));
console.log(JSON.stringify({total:unique.length,missing,all:unique},null,2));
await browser.close();
