const $=(s,p=document)=>p.querySelector(s);const $$=(s,p=document)=>[...p.querySelectorAll(s)];
function go(view){$$('.view').forEach(v=>v.classList.remove('active-view'));$('#'+view)?.classList.add('active-view');$$('.nav-item[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===view));$('.sidebar')?.classList.remove('open');scrollTo({top:0,behavior:'smooth'})}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));$('#mobileMenu').onclick=()=>$('.sidebar').classList.toggle('open');
function toast(message,icon='hgi-checkmark-circle-02'){const t=$('#toast');t.querySelector('span').textContent=message;t.querySelector('i').className=`hgi hgi-stroke ${icon}`;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2800)}
$('#pasteDemo').onclick=()=>{ $('#txHash').value='0x0d8f1f9c803289b71e902b74a09c28491dollyeo';$('#txPreview').classList.add('show');toast('Demo transaction found','hgi-blockchain-02')};
$('#incidentForm').onsubmit=e=>{e.preventDefault();if(!$('#txHash').value)return;toast('Transaction secured. Moving to incident details.');$$('.step')[0].classList.remove('active');$$('.step')[1].classList.add('active');setTimeout(()=>toast('Step 2 is ready in the full integration','hgi-information-circle'),700)};
$('#checkWallet').onclick=()=>{const input=$('#walletCheck');if(!input.value){input.value='0x9C21E8f2dA9784AD'};toast('Elevated risk · 2 verified attestations','hgi-alert-02')};
$('#issueAttestation').onclick=()=>toast('Mock attestation signed on GIWA Sepolia','hgi-certificate-01');
const modal=$('#demoModal');$('#watchDemo').onclick=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')};$('.modal-close').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
$('#runDemo').onclick=()=>{const b=$('#runDemo');b.innerHTML='<i class="hgi hgi-stroke hgi-loading-03"></i> Simulating transfer…';let steps=['Transfer detected…','Issuer attestation verified…','Settlement frozen…','12,400 USDT returned'];let i=0;const timer=setInterval(()=>{toast(steps[i],i===3?'hgi-checkmark-circle-02':'hgi-loading-03');b.innerHTML=`<i class="hgi hgi-stroke ${i===3?'hgi-checkmark-circle-02':'hgi-loading-03'}"></i> ${steps[i]}`;if(++i===steps.length){clearInterval(timer);setTimeout(()=>{closeModal();b.innerHTML='<i class="hgi hgi-stroke hgi-play-circle"></i> Run interactive demo'},1500)}},900)};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();$('.search input')?.focus()}});
function drawSpark(c){const ctx=c.getContext('2d'),dpr=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);const vals=[.72,.55,.62,.4,.48,.28,.34,.16];ctx.beginPath();vals.forEach((v,i)=>{const x=i*w/(vals.length-1),y=v*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,c.dataset.color+'55');g.addColorStop(1,c.dataset.color+'00');ctx.fillStyle=g;ctx.fill();ctx.beginPath();vals.forEach((v,i)=>{const x=i*w/(vals.length-1),y=v*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=c.dataset.color;ctx.lineWidth=1.4;ctx.stroke()}
function drawChart(){const c=$('#activityChart');if(!c)return;const ctx=c.getContext('2d'),dpr=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;for(let i=1;i<5;i++){const y=i*h/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}const lines=[{v:[.78,.62,.68,.42,.48,.3,.22,.28,.12],c:'#7df7c5'},{v:[.86,.8,.72,.68,.61,.58,.48,.42,.34],c:'#79a8ff'}];lines.forEach(({v,c:col})=>{ctx.beginPath();v.forEach((n,i)=>{const x=i*w/(v.length-1),y=n*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();if(col==='#7df7c5'){ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(125,247,197,.20)');g.addColorStop(1,'rgba(125,247,197,0)');ctx.fillStyle=g;ctx.fill()}})}
function redraw(){ $$('.spark').forEach(drawSpark);drawChart()}window.addEventListener('load',redraw);let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(redraw,120)});

// Full-stack API integration. The UI remains usable with seeded fallbacks if the API is offline.
const api = async (path, options={}) => {
  const response = await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});
  const payload = await response.json(); if(!response.ok) throw new Error(payload.error||'Request failed'); return payload;
};
async function hydrateDashboard(){
  try{const stats=await api('/api/stats'),values=$$('.metric strong');
    if(values[0])values[0].textContent=`₩${(stats.fundsProtectedKRW/1e9).toFixed(2)}B`;
    if(values[1])values[1].textContent=stats.resolvedCases.toLocaleString();
    if(values[2])values[2].textContent=`${String(Math.floor(stats.medianResponseSeconds/60)).padStart(2,'0')}:${String(stats.medianResponseSeconds%60).padStart(2,'0')}`;
    if(values[3])values[3].textContent=stats.verifiedIssuers;
  }catch{console.info('Using embedded dashboard data')}
}
async function hydrateCases() {
  try {
    const { items } = await api('/api/cases');
    
    // Update Recent Cases on Dashboard
    const recentList = $('.case-list');
    if (recentList) {
      recentList.innerHTML = '';
      items.slice(0, 3).forEach(c => {
        const isResolved = c.status === 'returned' || c.status === 'resolved';
        const isAttested = c.status === 'attested';
        const icon = isResolved ? 'success' : isAttested ? 'neutral' : 'warning';
        const iClass = isResolved ? 'hgi-checkmark-circle-02' : isAttested ? 'hgi-shield-02' : 'hgi-clock-02';
        const statusClass = isResolved ? 'resolved' : isAttested ? 'active' : 'pending';
        const statusText = isResolved ? 'Returned' : isAttested ? 'Attested' : 'Under review';
        
        recentList.innerHTML += `<button class="case-row" data-go="cases"><span class="case-icon ${icon}"><i class="hgi hgi-stroke ${iClass}"></i></span><span><strong>Case #${c.id}</strong><small>${c.asset} · ${c.amount.toLocaleString()}</small></span><span class="status ${statusClass}">${statusText}</span></button>`;
      });
      // Reattach navigation events
      $$('[data-go]', recentList).forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
    }

    // Update My Cases View
    const caseBoard = $('.case-board');
    if (caseBoard) {
      const head = $('.case-board-head', caseBoard).outerHTML;
      let html = head;
      
      items.forEach(c => {
        const isResolved = c.status === 'returned' || c.status === 'resolved';
        const isAttested = c.status === 'attested';
        const statusClass = isResolved ? 'resolved' : isAttested ? 'active' : 'pending';
        const statusText = isResolved ? 'Funds returned' : isAttested ? 'Attested' : 'Under review';
        const progressHtml = isResolved ? `<div class="case-progress-ring complete"><i class="hgi hgi-stroke hgi-checkmark-circle-02"></i></div>` : `<div class="case-progress-ring">${c.progress}%</div>`;
        
        let timelineHtml = '';
        if (!isResolved) {
          timelineHtml = `<div class="timeline"><span class="done">Report signed</span><span class="${isAttested ? 'done' : 'current'}">Evidence verified</span><span class="${isAttested ? 'done' : ''}">Issuer review</span><span class="${isAttested ? 'current' : ''}">Freeze attestation</span><span>Resolution</span></div>`;
        }
        
        html += `<div class="large-case">${progressHtml}<div><span class="status ${statusClass}">${statusText}</span><h2>Case #${c.id}</h2><p>${c.amount.toLocaleString()} ${c.asset} · GIWA Sepolia · ${new Date(c.createdAt).toLocaleString()}</p>${timelineHtml}</div><button class="secondary-btn">${isResolved ? 'View receipt' : 'Open case'} <i class="hgi hgi-stroke hgi-arrow-right-01"></i></button></div>`;
      });
      caseBoard.innerHTML = html;
    }
  } catch(e) {
    console.error('Failed to fetch cases', e);
  }
}

async function hydrateRegistry(query = '') {
  try {
    const { items } = await api('/api/threats' + (query ? `?query=${encodeURIComponent(query)}` : ''));
    const table = $('.registry-table');
    if (table) {
      const head = $('.table-head', table).outerHTML;
      let html = head;
      items.forEach(t => {
        const statusClass = t.risk === 'critical' ? 'danger' : t.risk === 'elevated' ? 'pending' : 'resolved';
        const riskText = t.risk.charAt(0).toUpperCase() + t.risk.slice(1);
        const addr = t.address.substring(0,6) + '…' + t.address.substring(t.address.length-4);
        html += `<div class="table-row"><strong>${addr}</strong><span class="status ${statusClass}">${riskText}</span><code>${t.attestationId || '-'}</code><span>${t.issuer || '-'}</span><time>${new Date(t.updatedAt).toLocaleTimeString()}</time></div>`;
      });
      table.innerHTML = html;
    }
  } catch(e) {
    console.error('Failed to fetch registry', e);
  }
}

$('#incidentForm').onsubmit=async e=>{e.preventDefault();const transactionHash=$('#txHash').value;if(!transactionHash)return;
  try{const created=await api('/api/cases',{method:'POST',body:JSON.stringify({transactionHash,asset:'USDT',amount:12400,from:'0x71A4b2A1902F',to:'0x9C21E8f2dA9784AD',incidentType:'voice_phishing'})});toast(`Case ${created.id} created on GIWA Sepolia`);$$('.step')[0].classList.remove('active');$$('.step')[1].classList.add('active');await hydrateCases();}
  catch(error){toast(error.message,'hgi-alert-02')}
};
$('#checkWallet').onclick=async()=>{const input=$('#walletCheck');if(!input.value)input.value='0x9C21E8f2dA9784AD';try{const result=await api('/api/threats/check',{method:'POST',body:JSON.stringify({address:input.value})});toast(`${result.risk.toUpperCase()} risk · ${result.linkedIncidents} linked incidents`,result.risk==='cleared'?'hgi-checkmark-circle-02':'hgi-alert-02')}catch(error){toast(error.message,'hgi-alert-02')}};
$('#issueAttestation').onclick=async()=>{try{
  const caseNumber=$('input[value="KR-FIU-2026-0948"]').value || 'KR-FIU-2026-0948';
  const account=$('input[value="0x9C21E8f2dA9784AD"]').value || '0x9C21E8f2dA9784AD';
  const created=await api('/api/attestations',{method:'POST',headers:{'x-issuer-key':'demo-issuer-key'},body:JSON.stringify({caseId:'DL-28491',caseNumber,account,reason:'Voice-phishing report matched to transfer and victim-signed claim.',challengeMinutes:30,expiresInHours:24})});
  toast(`${created.id} signed on GIWA Sepolia`,'hgi-certificate-01');
  await hydrateCases();
  await hydrateRegistry();
}catch(error){toast(error.message,'hgi-alert-02')}};

$('.registry-search button').onclick = () => hydrateRegistry($('.registry-search input').value);
$('.registry-search input').addEventListener('keydown', e => { if(e.key === 'Enter') hydrateRegistry(e.target.value); });

const initialView=location.hash.slice(1);if(['overview','report','cases','registry','console'].includes(initialView))go(initialView);addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(['overview','report','cases','registry','console'].includes(v))go(v)});hydrateDashboard();
hydrateCases();
hydrateRegistry();
