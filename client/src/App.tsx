import { useEffect, useState, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'
import { freezeRegistryABI } from './abi'

const CONTRACT_ADDRESS = '0xD0110000000000000000000000000000000007E0'

export default function App() {
  const { login, ready, authenticated, user, logout } = usePrivy()
  const [activeTab, setActiveTab] = useState('console')

  // Overview / SSE State
  const [cases] = useState([{ date: 'Mon', protected: 400, returned: 240 }, { date: 'Tue', protected: 300, returned: 139 }, { date: 'Wed', protected: 483, returned: 380 }])

  // Console State
  const [sigCount, setSigCount] = useState(0)
  const [devMode, setDevMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSponsoring, setIsSponsoring] = useState(false)
  const [ipfsCid, setIpfsCid] = useState('')
  
  // Ritual State
  const [ritualActive, setRitualActive] = useState(false)
  const [ritualLogs, setRitualLogs] = useState<string[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Report State
  const [kycVerified, setKycVerified] = useState(false)
  const [kycLoading, setKycLoading] = useState(false)
  const [txHashInput, setTxHashInput] = useState('')
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<null | { score: number, destination: string }>(null)

  // XMTP Chat State
  const [chatUnlocked, setChatUnlocked] = useState(false)
  const [chatUnlocking, setChatUnlocking] = useState(false)

  const { writeContract, data: txHash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    // Note: SSE stream removed for Vercel Serverless deployment
    // as serverless functions cannot maintain long-lived open connections.
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [ritualLogs])

  // Action Handlers
  const handleVerifyKyc = () => {
    setKycLoading(true)
    setTimeout(() => { setKycVerified(true); setKycLoading(false) }, 2000)
  }

  const handleAnalyzeTx = () => {
    if(!txHashInput) return;
    setAiAnalyzing(true)
    setTimeout(() => {
      setAiResult({ score: 98, destination: '0x9C21E8f2dA9784AD (Known Phishing Cluster)' })
      setAiAnalyzing(false)
    }, 2500)
  }

  const handleConsolePropose = () => {
    setSigCount(1)
    
    // Simulate Ritual Infernet AI Wakeup
    setTimeout(() => {
      setRitualActive(true)
      const logs = [
        '[System] Multi-sig proposal detected on GIWA Sepolia.',
        '[Infernet] Initializing Ritual Coprocessor...',
        '[Infernet] Fetching case data: KR-FIU-2026-0948',
        '[Model] Loading on-chain fraud analysis parameters...',
        '[Model] Evaluating transaction trace graph.',
        '[Model] MATCH FOUND: Destination is a known phishing cluster (Score: 98%).',
        '[Infernet] Generating zero-knowledge proof of execution.',
        '[Agent] Cryptographic signature generated.',
        '[Agent] Broadcasting co-signature to multi-sig contract.'
      ]
      
      let i = 0
      const interval = setInterval(() => {
        setRitualLogs(prev => [...prev, logs[i]])
        i++
        if (i === logs.length) {
          clearInterval(interval)
          setSigCount(2) // AI signs
          setTimeout(() => setRitualActive(false), 2000)
        }
      }, 800)
    }, 1000)
  }
  
  const handleConsoleSimulateSig = () => setSigCount(prev => Math.min(prev + 1, 3))
  
  const handleConsoleExecute = () => {
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      const mockCid = 'ipfs://Qm' + Math.random().toString(36).substring(2, 15) + '...'
      setIpfsCid(mockCid)
      
      setIsSponsoring(true)
      setTimeout(() => {
        setIsSponsoring(false)
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: freezeRegistryABI,
          functionName: 'issueAttestation',
          args: ['KR-FIU-2026-0948', '0x9C21E8f2dA9784AD', BigInt(Date.now() + 86400000), mockCid]
        })
      }, 2000)
    }, 1500)
  }

  const handleUnlockChat = () => {
    setChatUnlocking(true)
    setTimeout(() => {
      setChatUnlocked(true)
      setChatUnlocking(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-dollyeo-dark text-white font-sans flex overflow-hidden">
      <aside className="w-64 bg-white/5 border-r border-white/10 flex flex-col p-4 backdrop-blur-md shrink-0">
        <a className="flex items-center gap-3 mb-8 no-underline text-white" href="#" aria-label="Dollyeo home">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-dollyeo-green text-dollyeo-dark font-bold"><span>ㄷ</span></span>
          <span className="flex flex-col"><strong className="text-lg leading-none">Dollyeo</strong><small className="text-xs opacity-70 text-dollyeo-green">Give it back</small></span>
        </a>
        <nav aria-label="Primary navigation" className="flex flex-col gap-2">
          <button className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${activeTab === 'overview' ? 'bg-white/10 text-dollyeo-green' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('overview')}><i className="hgi hgi-stroke hgi-dashboard-square-01"></i><span>Overview</span></button>
          <button className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${activeTab === 'report' ? 'bg-white/10 text-dollyeo-green' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('report')}><i className="hgi hgi-stroke hgi-file-shield"></i><span>Report Incident</span></button>
          <button className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${activeTab === 'messages' ? 'bg-white/10 text-dollyeo-green' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('messages')}><i className="hgi hgi-stroke hgi-bubble-chat"></i><span>Messages</span></button>
          <button className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${activeTab === 'console' ? 'bg-white/10 text-dollyeo-green' : 'hover:bg-white/5'}`} onClick={() => setActiveTab('console')}><i className="hgi hgi-stroke hgi-police-badge"></i><span>Issuer Console</span></button>
        </nav>
        <div className="flex-1"></div>
        <div className="mt-4 p-3 rounded bg-black/40 border border-white/10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-dollyeo-green animate-pulse"></span>
          <div className="flex flex-col"><small className="text-xs opacity-60 uppercase">Network</small><strong className="text-sm">GIWA Sepolia</strong></div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="flex justify-between items-center p-4 border-b border-white/10 bg-dollyeo-dark/80 backdrop-blur sticky top-0 z-10 shrink-0">
          <div className="md:hidden flex items-center gap-2 font-bold"><span className="w-6 h-6 flex items-center justify-center rounded bg-dollyeo-green text-dollyeo-dark">ㄷ</span>Dollyeo</div>
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 w-96 text-sm">
            <i className="hgi hgi-stroke hgi-search-01 opacity-50"></i>
            <input className="bg-transparent border-none outline-none flex-1 text-white placeholder-white/50" aria-label="Search" placeholder="Search case, wallet or transaction…" />
          </div>
          <div className="flex items-center gap-4">
            {ready && authenticated ? (
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/10 transition" onClick={logout}>
                <span className="w-2 h-2 rounded-full bg-dollyeo-green"></span>
                <span>{user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</span>
                <i className="hgi hgi-stroke hgi-arrow-down-01 opacity-50"></i>
              </button>
            ) : (
              <button className="bg-dollyeo-green text-dollyeo-dark px-4 py-2 rounded-full font-bold text-sm hover:bg-white transition" onClick={login} disabled={!ready}>Connect Wallet</button>
            )}
          </div>
        </header>

        {activeTab === 'overview' && (
          <section className="p-8 shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div><span className="text-xs font-bold text-dollyeo-green tracking-wider uppercase mb-1 block">LIVE NETWORK</span><h2 className="text-2xl font-bold">Protection activity</h2></div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cases}>
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="protected" stroke="#7df7c5" strokeWidth={2} />
                    <Line type="monotone" dataKey="returned" stroke="#79a8ff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'report' && (
          <section className="p-8 shrink-0">
            <div className="mb-8">
              <span className="text-xs font-bold text-dollyeo-green tracking-wider uppercase mb-1 block">VICTIM PORTAL</span>
              <h1 className="text-3xl font-bold mb-2">Report Incident</h1>
              <p className="opacity-70">Securely trace and report stolen funds.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-2xl">
              {!kycVerified ? (
                <div className="text-center py-8">
                  <i className="hgi hgi-stroke hgi-shield-user text-5xl text-dollyeo-blue mb-4 inline-block"></i>
                  <h3 className="text-xl font-bold mb-2">Identity Verification Required</h3>
                  <p className="opacity-70 mb-8 max-w-md mx-auto">To prevent fraudulent reporting, victims must verify their identity using a Zero-Knowledge credential before submitting a claim.</p>
                  <button className="bg-dollyeo-blue text-dollyeo-dark px-6 py-3 rounded-full font-bold hover:bg-white transition" onClick={handleVerifyKyc} disabled={kycLoading}>
                    {kycLoading ? 'Verifying ZK Proof...' : 'Verify with ZK-ID'}
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-dollyeo-green flex items-center gap-2 mb-6 font-bold"><i className="hgi hgi-stroke hgi-tick-02"></i> Identity Verified</h3>
                  <div className="mb-6">
                    <label className="block text-sm opacity-70 mb-2">Stolen Transaction Hash</label>
                    <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-dollyeo-blue transition" placeholder="0x..." value={txHashInput} onChange={e => setTxHashInput(e.target.value)} />
                  </div>
                  {!aiResult && (
                    <button className="bg-dollyeo-blue text-dollyeo-dark px-6 py-3 rounded-full font-bold hover:bg-white transition" onClick={handleAnalyzeTx} disabled={aiAnalyzing || !txHashInput}>
                      {aiAnalyzing ? 'AI Risk Engine Analyzing Trace...' : 'Analyze Transaction'}
                    </button>
                  )}
                  {aiResult && (
                    <div className="mt-6 p-6 bg-dollyeo-red/10 border border-dollyeo-red rounded-lg">
                      <h4 className="text-dollyeo-red font-bold mb-4 flex items-center gap-2"><i className="hgi hgi-stroke hgi-artificial-intelligence-01"></i> AI Threat Intelligence Analysis</h4>
                      <p className="mb-2"><strong className="opacity-70 mr-2">Fraud Risk Score:</strong> {aiResult.score}%</p>
                      <p className="mb-6"><strong className="opacity-70 mr-2">Tracing Destination:</strong> {aiResult.destination}</p>
                      <button className="bg-dollyeo-red text-white px-6 py-3 rounded-full font-bold hover:bg-red-400 transition shadow-[0_0_20px_rgba(255,100,100,0.3)]">Submit Official Claim to GIWA</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="p-8 h-full flex flex-col overflow-hidden">
            <div className="mb-8 shrink-0">
              <span className="text-xs font-bold text-dollyeo-green tracking-wider uppercase mb-1 block">XMTP SECURE INBOX</span>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="opacity-70">End-to-End encrypted decentralized chat.</p>
            </div>
            
            <div className="flex-1 min-h-0 bg-white/5 border border-white/10 rounded-xl flex overflow-hidden max-w-4xl">
              {!chatUnlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <i className="hgi hgi-stroke hgi-lock-key text-2xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">XMTP Messages Locked</h3>
                  <p className="opacity-70 mb-8 max-w-sm">Sign a message with your connected wallet to initialize your XMTP client and decrypt your inbox.</p>
                  <button className="bg-white text-dollyeo-dark px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition" onClick={handleUnlockChat} disabled={chatUnlocking}>
                    {chatUnlocking ? 'Awaiting Signature...' : 'Sign to Decrypt'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-64 border-r border-white/10 bg-black/20 flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/10 font-bold flex items-center justify-between">
                      Chats <i className="hgi hgi-stroke hgi-edit-01 opacity-50 cursor-pointer"></i>
                    </div>
                    <div className="p-4 bg-white/5 border-l-2 border-dollyeo-green cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">0x9C21...84AD</span>
                        <span className="text-xs text-dollyeo-green">New</span>
                      </div>
                      <p className="text-xs opacity-70 truncate">Issuer: We have reviewed your case...</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col min-w-0 bg-black/40">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-dollyeo-blue to-purple-500"></div>
                      <div>
                        <div className="font-bold text-sm">0x9C21E8f2dA9784AD</div>
                        <div className="text-xs opacity-50">Joined XMTP via Dollyeo</div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                      <div className="self-end max-w-md bg-dollyeo-green text-dollyeo-dark p-3 rounded-2xl rounded-tr-sm text-sm">
                        I just submitted case KR-FIU-2026-0948. The AI analysis returned a 98% risk score.
                      </div>
                      <div className="self-start max-w-md bg-white/10 p-3 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                        We have received the IPFS evidence file. We are initiating the multi-sig freeze proposal now.
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/10 shrink-0">
                      <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-white/30 transition">
                        <input type="text" className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder-white/40" placeholder="Type an encrypted message..." />
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition ml-2">
                          <i className="hgi hgi-stroke hgi-send-01 text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {activeTab === 'console' && (
          <section className="p-8 shrink-0">
            <div className="mb-8">
              <span className="text-xs font-bold text-dollyeo-green tracking-wider uppercase mb-1 block">MULTI-SIG ISSUER WORKSPACE</span>
              <h1 className="text-3xl font-bold mb-2">Issuer console</h1>
              <p className="opacity-70">Propose and execute on-chain attestations securely with AI Co-signers.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex-1">
                {!devMode ? (
                  <div className="text-center py-8">
                    <i className="hgi hgi-stroke hgi-lock-01 text-5xl text-dollyeo-red mb-4 inline-block"></i>
                    <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                    <p className="opacity-70 mb-8 max-w-md mx-auto">Your connected wallet does not hold a Verified Issuer Soulbound Token (SBT). You cannot access this workspace.</p>
                    <button className="bg-white/10 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition" onClick={() => setDevMode(true)}>Dev Mode: Override Access</button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-dollyeo-green flex items-center gap-2 mb-8 font-bold"><i className="hgi hgi-stroke hgi-tick-02"></i> [DEV] Token Check Bypassed</h3>
                    <h2 className="text-2xl font-bold mb-2">Target: 0x9C21E8f2dA9784AD</h2>
                    <p className="opacity-70 mb-8 pb-8 border-b border-white/10">Reason: Voice-phishing report matched to transfer and victim-signed claim.</p>
                    
                    <div className="flex gap-4 items-center mb-8">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-300 ${sigCount >= 1 ? 'bg-dollyeo-green w-1/3' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-300 ${sigCount >= 2 ? 'bg-purple-500 w-1/3' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-300 ${sigCount >= 3 ? 'bg-dollyeo-green w-1/3' : 'w-0'}`}></div>
                      </div>
                      <span className="font-bold">{sigCount}/3 Signatures</span>
                    </div>

                    {sigCount === 0 && <button className="bg-dollyeo-green text-dollyeo-dark px-6 py-3 rounded-full font-bold hover:bg-white transition" onClick={handleConsolePropose}>Propose Attestation</button>}
                    {sigCount > 0 && sigCount < 3 && <button className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/20 transition" onClick={handleConsoleSimulateSig} disabled={ritualActive}>{ritualActive ? 'Ritual AI is reviewing...' : 'Simulate Human Co-Signer Approval'}</button>}
                    {sigCount === 3 && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-dollyeo-blue/10 border border-dollyeo-blue rounded-lg p-4 flex items-start gap-3">
                          <i className="hgi hgi-stroke hgi-gas-pump text-dollyeo-blue text-xl"></i>
                          <div>
                            <div className="font-bold text-sm text-dollyeo-blue mb-1">Account Abstraction (ERC-4337)</div>
                            <div className="text-xs opacity-80">Transaction fee will be sponsored by the Biconomy Paymaster.</div>
                            <div className="mt-2 font-mono text-xs"><span className="line-through opacity-50 mr-2">0.005 ETH</span><span className="text-dollyeo-green font-bold">$0.00 (Sponsored)</span></div>
                          </div>
                        </div>

                        <button className="bg-dollyeo-green text-dollyeo-dark px-6 py-3 rounded-full font-bold hover:bg-white transition w-full text-center" onClick={handleConsoleExecute} disabled={isLoading || isUploading || isSponsoring}>
                          {isUploading ? 'Uploading Evidence to IPFS...' : isSponsoring ? 'Requesting Paymaster Sponsorship...' : isLoading ? 'Executing Gasless Tx on Sepolia...' : isSuccess ? 'Execution Confirmed' : 'Execute Gasless Attestation'}
                        </button>
                      </div>
                    )}
                    {isSuccess && (
                      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 text-sm">
                        <p className="mb-2 text-dollyeo-green flex items-center gap-2"><i className="hgi hgi-stroke hgi-tick-02"></i> Successfully executed via Paymaster</p>
                        <p className="mb-1"><strong className="opacity-70 mr-2">Evidence IPFS CID:</strong> <span className="font-mono">{ipfsCid}</span></p>
                        <p><strong className="opacity-70 mr-2">Transaction Hash:</strong> <span className="font-mono text-dollyeo-blue">{txHash}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ritual Coprocessor UI */}
              <div className={`w-96 flex flex-col bg-[#050505] rounded-xl border ${ritualActive ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-white/10'} transition-all duration-500 overflow-hidden`}>
                <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black">
                  <div className={`w-3 h-3 rounded-full ${ritualActive ? 'bg-purple-500 animate-pulse' : 'bg-white/20'}`}></div>
                  <strong className="text-sm">Ritual AI Coprocessor</strong>
                </div>
                <div ref={terminalRef} className="p-4 font-mono text-xs opacity-80 flex-1 overflow-y-auto min-h-[300px] text-purple-200">
                  {ritualLogs.length === 0 ? (
                    <div className="opacity-30">Awaiting multi-sig proposal...</div>
                  ) : (
                    ritualLogs.map((log, i) => (
                      <div key={i} className="mb-2">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
