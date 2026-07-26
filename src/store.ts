import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import type { Attestation, CreateAttestationInput, CreateCaseInput, Database, FraudCase, ThreatEntry } from './types.js';

const now = () => new Date().toISOString();
const future = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

export const seedDatabase = (): Database => ({
  cases: [
    { id: 'DL-28491', transactionHash: '0x0d8f1f9c803289b71e902b74a09c28491dollyeo', chainId: 91342, asset: 'USDT', amount: 12400, from: '0x71A4b2A1902F', to: '0x9C21E8f2dA9784AD', incidentType: 'voice_phishing', description: 'Caller impersonated a prosecutor and requested a safety transfer.', status: 'under_review', progress: 68, createdAt: new Date(Date.now()-8*60_000).toISOString(), updatedAt: now() },
    { id: 'DL-28104', transactionHash: '0x8ca3e1882dollyeo28104', chainId: 91342, asset: 'ETH', amount: 2.84, from: '0x71A4b2A1902F', to: '0x81B71bC022C0', incidentType: 'investment_scam', description: 'Fraudulent investment platform transfer.', status: 'returned', progress: 100, createdAt: new Date(Date.now()-3*86_400_000).toISOString(), updatedAt: new Date(Date.now()-2*86_400_000).toISOString(), attestationId: 'AT-9402' }
  ],
  threats: [
    { address: '0x9C21E8f2dA9784AD', risk: 'critical', score: 82, attestationId: 'AT-94821', issuer: 'Mock FIU Korea', linkedIncidents: 4, expiresAt: future(24), updatedAt: new Date(Date.now()-2*60_000).toISOString() },
    { address: '0x81B71bC022C0', risk: 'elevated', score: 64, attestationId: 'AT-94818', issuer: 'Hanbit Bank', linkedIncidents: 2, expiresAt: future(48), updatedAt: new Date(Date.now()-12*60_000).toISOString() },
    { address: '0xE9129081A881', risk: 'cleared', score: 8, attestationId: 'AT-94702', issuer: 'GIWA VASP Lab', linkedIncidents: 0, expiresAt: future(72), updatedAt: new Date(Date.now()-3*3_600_000).toISOString() }
  ],
  issuers: [
    { id: 'issuer-fiu-demo', name: 'Mock FIU Korea', wallet: '0xF1U000000000D011', jurisdiction: 'KR', verified: true, online: true },
    { id: 'issuer-hanbit', name: 'Hanbit Bank', wallet: '0xB4NK000000000241', jurisdiction: 'KR', verified: true, online: true },
    { id: 'issuer-giwa-lab', name: 'GIWA VASP Lab', wallet: '0xVASP0000000091342', jurisdiction: 'KR', verified: true, online: true }
  ],
  attestations: []
});

export class Store {
  private db: Database = seedDatabase();
  private writeQueue: Promise<void> = Promise.resolve();
  constructor(private readonly path: string) {}

  async init() {
    await mkdir(dirname(this.path), { recursive: true });
    try { this.db = JSON.parse(await readFile(this.path, 'utf8')) as Database; }
    catch { await this.persist(); }
  }

  snapshot(): Database { return structuredClone(this.db); }

  stats() {
    const returned = this.db.cases.filter(c => c.status === 'returned').length;
    return { fundsProtectedKRW: 1_840_000_000, resolvedCases: 1284 + returned, recoveryRate: 94.2, medianResponseSeconds: 522, verifiedIssuers: this.db.issuers.filter(i=>i.verified).length + 21, attestedAddresses: 18_489 + this.db.threats.length, lastBlock: 9_842_114, network: { name: 'GIWA Sepolia', chainId: 91342 } };
  }

  listCases() { return [...this.db.cases].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
  getCase(id: string) { return this.db.cases.find(c=>c.id===id); }

  async createCase(input: CreateCaseInput): Promise<FraudCase> {
    const createdAt = now();
    const item: FraudCase = { id: `DL-${Math.floor(10000 + Math.random()*89999)}`, transactionHash: input.transactionHash, chainId: 91342, asset: input.asset || 'USDT', amount: Number(input.amount || 12400), from: input.from || '0x71A4b2A1902F', to: input.to || '0x9C21E8f2dA9784AD', incidentType: input.incidentType || 'voice_phishing', description: input.description || 'Submitted through the protected incident workflow.', status: 'under_review', progress: 32, createdAt, updatedAt: createdAt };
    this.db.cases.unshift(item); await this.persist(); return item;
  }

  listThreats(query='') { const q=query.toLowerCase(); return this.db.threats.filter(t=>!q || `${t.address} ${t.attestationId} ${t.issuer}`.toLowerCase().includes(q)); }
  checkThreat(address: string) { return this.db.threats.find(t=>t.address.toLowerCase()===address.toLowerCase()) || { address, risk:'cleared', score:4, linkedIncidents:0, attestationId:null, issuer:null, expiresAt:null, updatedAt:now() }; }

  async createAttestation(input: CreateAttestationInput): Promise<Attestation> {
    const issuer = this.db.issuers.find(i=>i.id==='issuer-fiu-demo')!;
    const createdAt = now();
    const att: Attestation = { id: `AT-${Math.floor(10000 + Math.random()*89999)}`, caseId: input.caseId || this.db.cases[0]?.id || 'unlinked', caseNumber: input.caseNumber, account: input.account, issuerId: issuer.id, reason: input.reason, challengeMinutes: Number(input.challengeMinutes || 30), expiresAt: future(Number(input.expiresInHours || 24)), signature: `0x${randomBytes(32).toString('hex')}`, createdAt };
    this.db.attestations.unshift(att);
    const fraudCase = this.db.cases.find(c=>c.id===att.caseId); if(fraudCase){fraudCase.status='attested';fraudCase.progress=82;fraudCase.attestationId=att.id;fraudCase.updatedAt=createdAt;}
    const existing = this.db.threats.find(t=>t.address.toLowerCase()===att.account.toLowerCase());
    const threat: ThreatEntry = existing || { address:att.account,risk:'critical',score:82,attestationId:att.id,issuer:issuer.name,linkedIncidents:1,expiresAt:att.expiresAt,updatedAt:createdAt };
    threat.attestationId=att.id; threat.issuer=issuer.name; threat.expiresAt=att.expiresAt; threat.updatedAt=createdAt;
    if(!existing)this.db.threats.unshift(threat);
    await this.persist(); return att;
  }

  private async persist() {
    this.writeQueue = this.writeQueue.then(async()=>{ const temp=`${this.path}.${randomUUID()}.tmp`; await writeFile(temp, JSON.stringify(this.db,null,2)); await rename(temp,this.path); });
    await this.writeQueue;
  }
}
