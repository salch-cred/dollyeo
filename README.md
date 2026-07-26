# Dollyeo (돌려오)
> **Give it back.** The Crypto-Native AI Anti-Fraud Super-App.

Dollyeo is an enterprise-grade Web3 platform designed to trace, freeze, and recover stolen crypto assets seamlessly. Built with bleeding-edge technologies, it bridges the gap between victims and multi-sig enforcement authorities (like the GIWA network).

## 🌟 Key Features

Dollyeo is not just a dashboard; it's a fully autonomous ecosystem:

- 🏎️ **Account Abstraction (ERC-4337)**: Gasless transaction execution. Issuers never pay ETH fees; all transactions are sponsored by Paymasters (Biconomy).
- 🧠 **Crypto-Native AI (Ritual)**: Human bottlenecks are removed. An Autonomous AI Agent acts as a co-signer, reading IPFS evidence, running on-chain LLMs, and autonomously signing attestations.
- 💬 **Decentralized Chat (XMTP)**: End-to-end encrypted messaging between victims and issuers based entirely on wallet addresses.
- 🛡️ **Zero Trust Token Gating**: The Issuer Console is locked by default and requires a Verified Authority Soulbound Token (SBT) to access.
- 🗂️ **Decentralized Evidence**: All case reports and AI analysis logs are uploaded to IPFS, keeping the on-chain footprint minimal while guaranteeing immutable evidence trails.
- 💳 **Victim KYC (ZK-Proofs)**: Prevents fraudulent reporting by enforcing Zero-Knowledge identity verification before a claim can be submitted.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts.
- **Web3 Layer**: Wagmi, Viem, Privy (Embedded Wallets).
- **Backend**: Node.js (SSE for Real-Time Event Streaming).
- **Simulations**: Ritual Infernet (AI), Biconomy (Paymaster), XMTP (Chat), AnonAadhaar (ZK-KYC).

## 🚀 Getting Started

To run the Dollyeo Super-App locally:

1. **Start the Backend API:**
   ```bash
   npm run start
   ```
   *(Runs on http://localhost:4173. Provides the SSE stream and mock state).*

2. **Start the Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   *(Runs on http://localhost:5173).*

## 📖 Using the App

1. **Report Incident**: Verify your identity (mock ZK proof) and submit a stolen transaction hash. The AI Risk Engine will analyze the trace instantly.
2. **Messages**: Sign a message to unlock your XMTP inbox and communicate directly with Issuers.
3. **Issuer Console**: Bypass the Token Gate (Dev Mode) and click "Propose Attestation". Watch as the **Ritual AI Coprocessor** spins up, analyzes the IPFS evidence, and autonomously co-signs the transaction. Finally, execute the transaction completely gas-free!

---
*Built with ❤️ for a safer Web3.*
