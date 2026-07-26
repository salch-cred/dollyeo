import test from 'node:test';import assert from 'node:assert/strict';import { once } from 'node:events';
process.env.NODE_ENV='test';
const { createDollyeoServer } = await import('../src/server.js');

test('health, threat check and case creation',async()=>{const server=await createDollyeoServer();server.listen(0);await once(server,'listening');const address=server.address();if(!address||typeof address==='string')throw new Error('No test port');const base=`http://127.0.0.1:${address.port}`;
  const health=await fetch(`${base}/api/health`).then(r=>r.json()) as {ok:boolean;chainId:number};assert.equal(health.ok,true);assert.equal(health.chainId,91342);
  const threat=await fetch(`${base}/api/threats/check`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({address:'0x9C21E8f2dA9784AD'})}).then(r=>r.json()) as {risk:string};assert.equal(threat.risk,'critical');
  const created=await fetch(`${base}/api/cases`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({transactionHash:'0x1234567890abcdef',amount:99})});assert.equal(created.status,201);
  server.close();await once(server,'close');
});
