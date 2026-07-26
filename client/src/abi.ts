export const freezeRegistryABI = [
  {
    "type": "function",
    "name": "issueAttestation",
    "inputs": [
      { "name": "caseId", "type": "string" },
      { "name": "account", "type": "address" },
      { "name": "expiresAt", "type": "uint256" },
      { "name": "reason", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyOrder",
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view"
  }
] as const;
