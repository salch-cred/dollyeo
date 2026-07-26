export type CaseStatus = 'under_review' | 'attested' | 'frozen' | 'returned' | 'released';
export type RiskLevel = 'critical' | 'elevated' | 'watch' | 'cleared';

export interface FraudCase {
  id: string;
  transactionHash: string;
  chainId: number;
  asset: string;
  amount: number;
  from: string;
  to: string;
  incidentType: string;
  description: string;
  status: CaseStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  attestationId?: string;
}

export interface ThreatEntry {
  address: string;
  risk: RiskLevel;
  score: number;
  attestationId: string;
  issuer: string;
  linkedIncidents: number;
  expiresAt: string;
  updatedAt: string;
}

export interface Issuer {
  id: string;
  name: string;
  wallet: string;
  jurisdiction: string;
  verified: boolean;
  online: boolean;
}

export interface Attestation {
  id: string;
  caseId: string;
  caseNumber: string;
  account: string;
  issuerId: string;
  reason: string;
  challengeMinutes: number;
  expiresAt: string;
  signature: string;
  createdAt: string;
}

export interface Database {
  cases: FraudCase[];
  threats: ThreatEntry[];
  issuers: Issuer[];
  attestations: Attestation[];
}

export interface CreateCaseInput {
  transactionHash: string;
  asset?: string;
  amount?: number;
  from?: string;
  to?: string;
  incidentType?: string;
  description?: string;
}

export interface CreateAttestationInput {
  caseId?: string;
  caseNumber: string;
  account: string;
  reason: string;
  challengeMinutes?: number;
  expiresInHours?: number;
}
