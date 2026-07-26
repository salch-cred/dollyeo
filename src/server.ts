import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.js';
import type { CreateAttestationInput, CreateCaseInput } from './types.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = join(root, 'public');
const store = new Store(join(root, 'data', 'db.json'));
const port = Number(process.env.PORT || 4173);
const issuerKey = process.env.ISSUER_DEMO_KEY || 'demo-issuer-key';
const rate = new Map<string,{count:number;reset:number}>();
const clients = new Set<ServerResponse>();
const broadcast = (data: any) => clients.forEach(c => c.write(`data: ${JSON.stringify(data)}\n\n`));

const mime: Record<string,string> = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8','.ico':'image/x-icon' };

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(JSON.stringify(body));
}
function headers(res: ServerResponse) {
  res.setHeader('x-content-type-options','nosniff'); res.setHeader('x-frame-options','DENY'); res.setHeader('referrer-policy','strict-origin-when-cross-origin'); res.setHeader('permissions-policy','camera=(), microphone=(), geolocation=()'); res.setHeader('content-security-policy',"default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.hugeicons.com; font-src 'self' https://fonts.gstatic.com https://cdn.hugeicons.com; img-src 'self' data:; script-src 'self'; connect-src 'self'");
}
async function body<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[]=[]; let size=0;
  for await (const chunk of req) { size += chunk.length; if(size>64_000) throw new Error('Payload too large'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as T; } catch { throw new Error('Invalid JSON'); }
}
function limited(req: IncomingMessage) { const ip=req.socket.remoteAddress||'local', now=Date.now(), slot=rate.get(ip); if(!slot||slot.reset<now){rate.set(ip,{count:1,reset:now+60_000});return false;} slot.count++; return slot.count>120; }
function validHash(value: unknown) { return typeof value==='string' && /^0x[a-zA-Z0-9]{12,128}$/.test(value); }
function validAddress(value: unknown) { return typeof value==='string' && /^0x[a-zA-Z0-9]{8,64}$/.test(value); }

export async function createDollyeoServer() {
  await store.init();
  return createServer(async(req,res)=>{
    headers(res);
    const url = new URL(req.url || '/', 'http://' + (req.headers.host || 'localhost')); const path = url.pathname;
    if(path.startsWith('/api/') && limited(req)) return json(res,429,{error:'Rate limit exceeded'});
    try {
      if(path==='/api/health' && req.method==='GET') return json(res,200,{ok:true,service:'dollyeo-api',network:'GIWA Sepolia',chainId:91342,time:new Date().toISOString()});
      if(path==='/api/stats' && req.method==='GET') return json(res,200,store.stats());
      if(path==='/api/stream' && req.method==='GET') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
        res.write('data: connected\n\n');
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return;
      }
      if(path==='/api/cases' && req.method==='GET') return json(res,200,{items:store.listCases()});
      if(path==='/api/cases' && req.method==='POST') { 
        const input=await body<CreateCaseInput>(req); 
        if(!validHash(input.transactionHash))return json(res,400,{error:'A valid transaction hash is required'}); 
        const created = await store.createCase(input);
        broadcast({ type: 'CASE_CREATED', data: created });
        return json(res,201,created); 
      }
      const caseMatch=path.match(/^\/api\/cases\/([^/]+)$/); if(caseMatch&&req.method==='GET'){const item=store.getCase(decodeURIComponent(caseMatch[1]!));return item?json(res,200,item):json(res,404,{error:'Case not found'});}
      if(path==='/api/threats'&&req.method==='GET')return json(res,200,{items:store.listThreats(url.searchParams.get('query')||'')});
      if(path==='/api/threats/check'&&req.method==='POST'){const input=await body<{address:string}>(req);if(!validAddress(input.address))return json(res,400,{error:'A valid wallet address is required'});return json(res,200,store.checkThreat(input.address));}
      if(path==='/api/issuers'&&req.method==='GET')return json(res,200,{items:store.snapshot().issuers});
      if(path==='/api/attestations'&&req.method==='POST'){
        if(req.headers['x-issuer-key']!==issuerKey)return json(res,401,{error:'Verified issuer credential required'});
        const input=await body<CreateAttestationInput>(req);
        if(!input.caseNumber||!validAddress(input.account)||!input.reason)return json(res,400,{error:'caseNumber, account and reason are required'});
        const created = await store.createAttestation(input);
        broadcast({ type: 'ATTESTATION_CREATED', data: created });
        return json(res,201,created);
      }
      if(path.startsWith('/api/')) return json(res,404,{error:'API route not found'});

      const requested=path==='/'?'index.html':path.slice(1); const safe=normalize(requested).replace(/^(\.\.(\/|\\|$))+/, ''); const file=join(publicDir,safe);
      if(!file.startsWith(publicDir)) return json(res,403,{error:'Forbidden'});
      const info=await stat(file); if(!info.isFile())throw new Error('Not a file'); const data=await readFile(file); res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':extname(file)==='.html'?'no-cache':'public, max-age=3600'}); res.end(data);
    } catch(error) { if(path.startsWith('/api/')) return json(res,error instanceof Error&&error.message==='Payload too large'?413:400,{error:error instanceof Error?error.message:'Request failed'}); try{const fallback=await readFile(join(publicDir,'index.html'));res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(fallback);}catch{json(res,404,{error:'Not found'});} }
  });
}

if(process.env.NODE_ENV!=='test') { const server=await createDollyeoServer(); server.listen(port,()=>console.log(`Dollyeo running at http://localhost:${port}`)); }
