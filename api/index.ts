import { type VercelRequest, type VercelResponse } from '@vercel/node';
import { Store } from '../src/store.js';
import { join } from 'node:path';

// Note: Vercel serverless functions are ephemeral. 
// Writing to db.json in /tmp is possible but data will reset on cold starts.
const store = new Store('/tmp/db.json');

// Initialize the store asynchronously on the first request if needed
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await store.init();
    initialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureInit();
  const path = req.url?.split('?')[0] || '/';

  try {
    if (path === '/api/health' && req.method === 'GET') {
      return res.status(200).json({ ok: true, service: 'dollyeo-serverless', network: 'GIWA Sepolia', chainId: 91342, time: new Date().toISOString() });
    }
    
    if (path === '/api/stats' && req.method === 'GET') {
      return res.status(200).json(store.stats());
    }
    
    if (path === '/api/cases' && req.method === 'GET') {
      return res.status(200).json({ items: store.listCases() });
    }
    
    if (path === '/api/cases' && req.method === 'POST') {
      const created = await store.createCase(req.body);
      return res.status(201).json(created);
    }
    
    if (path === '/api/threats' && req.method === 'GET') {
      return res.status(200).json({ items: store.listThreats((req.query.query as string) || '') });
    }
    
    if (path === '/api/issuers' && req.method === 'GET') {
      return res.status(200).json({ items: store.snapshot().issuers });
    }

    // SSE Stream Removed: Vercel functions cannot hold open connections efficiently
    if (path === '/api/stream') {
      return res.status(400).json({ error: 'SSE is not supported in Vercel Serverless environment.' });
    }

    return res.status(404).json({ error: 'API route not found on Serverless Handler' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Serverless Request Failed' });
  }
}
