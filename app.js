/* dStock — DApp logic (vanilla JS + EIP-1193). Zero build step. */
(function () {
  const C = window.DSTOCK_CONFIG;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const fmt = new Intl.NumberFormat('en-US');
  const money = (n) => '$' + fmt.format(Math.round(n * 100) / 100);
  const num = (n, d = 2) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d });

  let account = null;
  let tokenMeta = { holders: 0, totalSupply: 1000000000, priceUSD: 0.0298, balance: null };

  /* ---------------- navigation ---------------- */
  function show(view) {
    $$('.view').forEach((v) => (v.hidden = v.id !== 'view-' + view));
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
    $('#hero').style.display = view === 'swap' ? '' : 'none';
  }
  $$('.tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  $$('[data-jump]').forEach((b) => b.addEventListener('click', () => show(b.dataset.jump)));

  function toast(msg, ms = 3200) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(el._t); el._t = setTimeout(() => (el.hidden = true), ms);
  }

  /* ---------------- chain helpers ---------------- */
  function eth() { return (typeof window.ethereum !== 'undefined') ? window.ethereum : null; }
  async function ensureChain() {
    const e = eth(); if (!e) return false;
    try {
      const cid = await e.request({ method: 'eth_chainId' });
      if (cid.toLowerCase() === C.chain.chainIdHex) return true;
      await e.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: C.chain.chainIdHex }] });
      return true;
    } catch (err) {
      if (err && err.code === 4902) {
        try { await e.request({ method: 'wallet_addEthereumChain', params: [C.chain] }); return true; }
        catch (e2) { return false; }
      }
      return false;
    }
  }

  /* ---------------- wallet connect ---------------- */
  const modal = () => $('#walletModal');
  function detectEip(id) {
    const e = eth(); if (!e) return false;
    const f = e.flags || {};
    if (id === 'metamask') return !!e.isMetaMask && !(f.isRabby || f.isCoinbaseWallet || f.isTrust || f.isBinance || e.isOKX);
    if (id === 'rabby') return !!(f.isRabby || e.isRabby);
    if (id === 'coinbase') return !!f.isCoinbaseWallet;
    if (id === 'trust') return !!f.isTrust || e.isTrust;
    if (id === 'binance') return !!f.isBinance || e.isBinance;
    if (id === 'okx') return !!e.isOKX || !!f.isOkx || !!f.isOKXWallet;
    return false;
  }
  async function connect(providerId) {
    closeWalletModal();
    if (providerId === 'walletconnect') { toast('WalletConnect relay coming soon — connect via Rabby/OKX in-app browser meanwhile.'); return; }
    if (providerId === 'privy-google' || providerId === 'privy-x') {
      const app = (C.wallet.privyAppId || '').trim();
      if (!app) { toast('Social login (Google / X via Privy) — add your Privy App ID in config.js → wallet.privyAppId.'); return; }
      toast('Privy SDK not bundled yet — drop the snippet in index.html using App ID ' + app.slice(0, 8) + '…');
      return;
    }
    if (!eth()) {
      const p = C.wallet.providers.find((x) => x.id === providerId);
      toast('No injected wallet detected' + (p ? ' — installing/using ' + p.name : '') + '.');
      if (p) window.open(p.install, '_blank');
      return;
    }
    try {
      const accts = await eth().request({ method: 'eth_requestAccounts' });
      if (!accts || !accts.length) return;
      account = accts[0];
      const ok = await ensureChain();
      if (!ok) toast('Please switch to Robinhood Chain Testnet (46630).');
      renderConnect();
      refreshPortfolio();
    } catch (e) { /* user rejected */ }
  }
  function openWalletModal() { modal().hidden = false; }
  function closeWalletModal() { modal().hidden = true; }
  $('#connectBtn').addEventListener('click', () => { account ? toggleAccountMenu() : openWalletModal(); });
  $('#walletClose').addEventListener('click', closeWalletModal);
  modal().addEventListener('click', (e) => { if (e.target === modal()) closeWalletModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeWalletModal(); closeAccountMenu(); } });

  function renderWalletModal() {
    $('#walletList').innerHTML = C.wallet.providers.map((p) => `
      <button class="wrow" data-w="${p.id}">
        <span class="wlogo" style="background:${p.color}">${p.name[0]}</span>
        ${p.name}
        <span class="wtag ${detectEip(p.id) ? '' : 'missing'}">${detectEip(p.id) ? 'DETECTED' : 'INSTALL'}</span>
      </button>`).join('');
    $$('#walletList .wrow').forEach((b) => b.addEventListener('click', () => connect(b.dataset.w)));
    $('#walletSocial').innerHTML = `
      <button class="wrow slim" data-w="privy-google"><span class="wico"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77a5.99 5.99 0 0 1-8.94-3.13H3.07v2.77A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.35 14.44a6.6 6.6 0 0 1 0-4.88V6.79H3.07a11 11 0 0 0 0 10.42l2.28-2.77z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 3.07 6.79l2.28 2.77A5.99 5.99 0 0 1 12 5.38z"/></svg></span> Google</button>
      <button class="wrow slim" data-w="privy-x"><span class="wico"><svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M18.9 1.5h3.7l-8.1 9.2L24 22.5h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.9L0 1.5h7.6l5.3 7 6-7zM17.7 20.3h2L6.2 3.6h-2.2z"/></svg></span> X (Twitter)</button>`;
    $$('#walletSocial .wrow').forEach((b) => b.addEventListener('click', () => connect(b.dataset.w)));
  }
  function renderConnect() {
    const b = $('#connectBtn');
    if (account) {
      b.classList.add('connected');
      b.textContent = account.slice(0, 6) + '…' + account.slice(-4) + ' ▾';
    } else {
      b.classList.remove('connected'); b.textContent = 'CONNECT';
      closeAccountMenu();
    }
    renderSwapBtn();
  }
  /* ---- account dropdown (switch wallet / sign out) ---- */
  function ensureAccountMenu() {
    if (document.getElementById('acctMenu')) return;
    const m = document.createElement('div');
    m.id = 'acctMenu';
    m.className = 'acct-menu';
    m.hidden = true;
    m.innerHTML = `
      <button data-am="switch">⇄&nbsp; Connect another wallet</button>
      <button data-am="out">⎋&nbsp; Sign out</button>`;
    $('#connectBtn').parentElement.appendChild(m);
    m.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAccountMenu();
      if (b.dataset.am === 'switch') { signOut(true); openWalletModal(); }
      else signOut(false);
    }));
  }
  function toggleAccountMenu() {
    ensureAccountMenu();
    const m = document.getElementById('acctMenu');
    m.hidden = !m.hidden;
    if (!m.hidden) {
      const r = $('#connectBtn').getBoundingClientRect();
      m.style.top = (r.bottom + 8) + 'px';
      m.style.right = (window.innerWidth - r.right) + 'px';
    }
  }
  function closeAccountMenu() { const m = document.getElementById('acctMenu'); if (m) m.hidden = true; }
  document.addEventListener('click', (e) => {
    const m = document.getElementById('acctMenu');
    if (m && !m.hidden && !m.contains(e.target) && e.target.id !== 'connectBtn') closeAccountMenu();
  });
  function signOut(reconnectMode) {
    account = null;
    try { eth() && eth().removeListeners && eth().removeListeners(); } catch (e) {}
    renderConnect(); refreshPortfolio();
    if (!reconnectMode) toast('Signed out. You can connect a different wallet now.');
  }
  /* ---- swap button state follows wallet ---- */
  function renderSwapBtn() {
    const b = $('#swapBtn');
    if (!b) return;
    b.textContent = account ? 'SWAP' : 'CONNECT WALLET';
  }
  if (eth()) {
    eth().on && eth().on('accountsChanged', (a) => { account = a && a[0] || null; renderConnect(); refreshPortfolio(); });
    eth().on && eth().on('chainChanged', () => location.reload());
  }

  /* ---------------- data (Blockscout API, CORS-friendly) ---------------- */
  async function api(path) {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 9000);
    let r;
    try { r = await fetch(C.token.explorerApi + path, { signal: ctl.signal }); }
    finally { clearTimeout(to); }
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }
  async function loadTokenMeta() {
    try {
      const t = await api('/tokens/' + C.token.address);
      tokenMeta.holders = Number(t.holders_count) || tokenMeta.holders;
      tokenMeta.totalSupply = Number(t.total_supply) / 1e18 || tokenMeta.totalSupply;
    } catch (e) {
      const f = (C.token.fallback || {});
      tokenMeta.holders = f.holders || tokenMeta.holders;
      tokenMeta.totalSupply = f.totalSupply || tokenMeta.totalSupply;
    }
  }
  async function loadBalance(addr) {
    try {
      const list = await api('/addresses/' + addr + '/token-balances');
      const items = Array.isArray(list) ? list : (list.items || []);
      for (const it of items) {
        const tk = it.token || it;
        const a = (tk.address_hash || tk.address || '').toLowerCase();
        if (a === C.token.address.toLowerCase()) {
          return Number(it.value || it.balance || 0) / 1e18;
        }
      }
      return 0;
    } catch (e) { return null; }
  }

  /* ---------------- hero stats ---------------- */
  function renderHero() {
    const stocksEarned = C.treasury.totalDistributedUSD;
    $('#heroStats').innerHTML = `
      <div class="hstat"><div class="v">${money(stocksEarned)}</div><div class="l">TOTAL STOCKS DISTRIBUTED</div></div>
      <div class="hstat"><div class="v">${num(C.treasury.feesCollectedETH)} ETH</div><div class="l">FEES COLLECTED</div></div>
      <div class="hstat"><div class="v">${fmt.format(tokenMeta.holders)}</div><div class="l">WALLETS</div></div>
      <div class="hstat"><div class="v">$${tokenMeta.priceUSD}</div><div class="l">$DSTOCK PRICE</div></div>`;
  }

  /* ---------------- swap ---------------- */
  const RATE = tokenMeta.priceUSD || 0.0298; // 1 DSTOCK ≈ $0.0298, ETH $4100
  const LS_ROUTER = 'dstock_router';
  function routerSet() { return (localStorage.getItem(LS_ROUTER) || C.swap.routerAddress || '').trim(); }
  function renderSwap() {
    const rt = routerSet();
    $('#routerIn').value = rt;
    $('#routerIn').classList.toggle('set', !!rt);
    if (rt && account && rt.toLowerCase() === account.toLowerCase()) $('#routerIn').classList.add('err');
    $('#swapNote').textContent = rt
      ? `Router: ${rt.slice(0, 10)}…${rt.slice(-6)} · path ${C.swap.pathSymbols.join(' → ')} · fee tier ${C.swap.feeTier}`
      : C.swap.routerNote;
    $('#chipTo').textContent = C.token.symbol + ' ▾';
  }
  $('#routerSave').addEventListener('click', async () => {
    let v = $('#routerIn').value.trim();
    $('#routerIn').classList.remove('err');
    if (v && !/^0x[0-9a-fA-F]{40}$/.test(v)) { toast('Invalid address — must be 0x + 40 hex characters.'); return; }
    if (v && account && v.toLowerCase() === account.toLowerCase()) {
      toast('That is your own wallet address — routers are contracts. Not saved.'); $('#routerIn').classList.add('err'); return;
    }
    if (v && eth()) {
      try {
        const code = await eth().request({ method: 'eth_getCode', params: [v, 'latest'] });
        if (!code || code === '0x') { toast('Address has no contract code on this chain — likely not a router. Not saved.'); $('#routerIn').classList.add('err'); return; }
      } catch (e) { toast('Saved — but router could not be verified on-chain right now (network blocked?).'); }
    }
    if (v) localStorage.setItem(LS_ROUTER, v); else localStorage.removeItem(LS_ROUTER);
    renderSwap();
    toast(v ? 'Router verified & saved — swap will execute through this address.' : 'Router cleared.');
  });
  let ethPriceUSD = 4100; // testnet indicative
  function quote() {
    const vin = parseFloat($('#amtIn').value);
    if (!vin || vin <= 0) { $('#amtOut').value = ''; $('#swapQuote').textContent = account ? 'Enter an amount.' : 'Connect wallet for a live quote.'; return; }
    const fee = vin * ethPriceUSD * 0.015;
    const out = (vin * ethPriceUSD - fee) / RATE;
    $('#amtOut').value = num(out, 0);
    $('#swapQuote').textContent = `fee ${money(fee)} → treasury · you receive ≈ ${fmt.format(Math.floor(out))} $DSTOCK`;
  }
  $('#amtIn').addEventListener('input', quote);
  $('#swapBtn').addEventListener('click', async () => {
    if (!account) { openWalletModal(); return; }
    const v = parseFloat($('#amtIn').value);
    if (!v || v <= 0) { toast('Enter an amount first.'); return; }
    const rt = routerSet();
    if (!rt) { toast('Add a router address in the ROUTER field first.'); $('#routerIn').focus(); return; }
    // --- safety guards: prevent sending swap tx to a wrong destination ---
    if (rt.toLowerCase() === account.toLowerCase()) {
      toast('Router address = your own wallet. Paste the POOL/ROUTER contract address, not your wallet.');
      $('#routerIn').focus(); $('#routerIn').classList.add('err'); return;
    }
    if (rt.toLowerCase() === C.token.address.toLowerCase()) {
      toast('That is the $DSTOCK token contract, not the swap router.');
      $('#routerIn').focus(); $('#routerIn').classList.add('err'); return;
    }
    try {
      const code = await eth().request({ method: 'eth_getCode', params: [rt, 'latest'] });
      if (!code || code === '0x') {
        toast('Address has no contract code on Robinhood Chain testnet — not a router. Swap blocked.');
        $('#routerIn').focus(); $('#routerIn').classList.add('err'); return;
      }
    } catch (e) {
      toast('Cannot verify router via RPC right now (network blocked?). Try again or use a faucet-side VPN.');
      return;
    }
    $('#routerIn').classList.remove('err');
    // send via injected wallet using a V2-style exactETHIn call:
    // swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin,address[] path,address to,uint256 deadline)
    // selector 0x791ac947 — amountOutMin = 95% of quote (slippage 5%)
    try {
      const vin = BigInt(Math.floor(v * 1e18));
      const outMin = BigInt(Math.floor(parseFloat($('#amtOut').value) * 0.95 * 1e18));
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
      const data =
        '0x791ac947' +
        outMin.toString(16).padStart(64, '0') +
        (128).toString(16).padStart(64, '0') +      // path array offset = 4 words
        account.slice(2).padStart(64, '0') +
        deadline.toString(16).padStart(64, '0') +
        (2).toString(16).padStart(64, '0') +        // path length = 2
        (C.swap.wethAddress || '0x' + '0'.repeat(40)).slice(2).padStart(64, '0') +
        C.token.address.slice(2).padStart(64, '0');
      await eth().request({ method: 'eth_sendTransaction', params: [{ from: account, to: rt, value: '0x' + vin.toString(16), data }] });
      toast('Swap transaction submitted — check your wallet / explorer.');
    } catch (e) {
      toast('Wallet rejected the tx: ' + (e && e.message ? e.message.slice(0, 90) : String(e)));
    }
  });

  /* ---------------- portfolio ---------------- */
  async function refreshPortfolio() {
    const el = $('#portfolioCards');
    if (!account) {
      el.innerHTML = `<div class="pcard" style="grid-column:1/-1"><div class="l">STATUS</div><div class="v" style="font-size:16px">Wallet not connected</div><div class="s">Connect to read your on-chain $DSTOCK balance from Robinhood Chain testnet.</div></div>`;
      $('#eligibilityCard').innerHTML = `<span class="dot"></span><span class="t">Eligibility: hold <b>${C.eligibility.minHoldLabel}</b> or more to receive stock distributions.</span>`;
      return;
    }
    el.innerHTML = `<div class="pcard" style="grid-column:1/-1"><div class="l">SYNCING…</div><div class="v">—</div></div>`;
    const bal = await loadBalance(account);
    tokenMeta.balance = bal;
    if (bal === null) {
      el.innerHTML = `<div class="pcard" style="grid-column:1/-1"><div class="l">SYNC</div><div class="v" style="font-size:15px">Explorer API unreachable</div><div class="s">Check connectivity; balances read live from Blockscout when online.</div></div>`;
      return;
    }
    const sharePct = bal / tokenMeta.totalSupply * 100;
    const estUSD = bal * RATE * 0.0317; // ~ historical distribution ratio mock
    el.innerHTML = `
      <div class="pcard"><div class="l">$DSTOCK BALANCE</div><div class="v">${fmt.format(Math.floor(bal))}</div><div class="s">${money(bal * RATE)} · ${sharePct.toFixed(3)}% of supply</div></div>
      <div class="pcard"><div class="l">EST. STOCKS EARNED</div><div class="v">${money(estUSD)}</div><div class="s">pro-rata to protocol epochs</div></div>
      <div class="pcard"><div class="l">ASSET RATIO</div><div class="v">${sharePct.toFixed(3)}%</div><div class="s">supply ${fmt.format(tokenMeta.totalSupply)}</div></div>`;
    const eligible = bal >= C.eligibility.minHoldTokens;
    $('#eligibilityCard').className = 'eligibility' + (eligible ? ' ok' : '');
    $('#eligibilityCard').innerHTML = eligible
      ? `<span class="dot"></span><span class="t"><b>ELIGIBLE.</b> Your balance qualifies for the next stock distribution epoch.</span>`
      : `<span class="dot"></span><span class="t">Not yet eligible — hold at least <b>${C.eligibility.minHoldLabel}</b>. Add <b>${fmt.format(C.eligibility.minHoldTokens - Math.floor(bal))} $DSTOCK</b> more.</span>`;
  }

  /* ---------------- distribution ---------------- */
  function renderDist() {
    $('#feePct').textContent = C.treasury.feePercentLabel;
    $('#minHold').textContent = C.eligibility.minHoldLabel;
    $('#distFeed').innerHTML = C.distributionFeed.map((row) => `
      <div class="feed-row"><span class="d">${row.date}</span>
        ${row.items.map(([t, q]) => `<span class="tk">${t} <b>+${q}</b></span>`).join('')}
      </div>`).join('');
    // countdown to next epoch boundary (UTC midnight cadence)
    const h = C.treasury.distributionIntervalHours;
    function tick() {
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(0, 0, 0, 0);
      if (now.getUTCHours() >= 0) next.setUTCDate(next.getUTCDate() + 1);
      const secs = Math.max(0, Math.floor((next - now) / 1000));
      const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
      const mm = String(Math.floor(secs % 3600 / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      $('#countdown').textContent = `${hh}:${mm}:${ss}`;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- rwa ---------------- */
  function renderRwa() {
    $('#stockGrid').innerHTML = C.stocks.map((s) => `
      <div class="stock-card">
        <div class="tick">${s.ticker}</div><div class="nm">${s.name}</div>
        <div class="pr">$${fmt.format(s.price)}</div>
        <div class="st">IN DSTOCK BASKET</div>
      </div>`).join('');
  }

  /* ---------------- footer / ca ---------------- */
  function renderCA() {
    const short = C.token.address.slice(0, 10) + '…' + C.token.address.slice(-6);
    $('#caText').textContent = short;
    $('#caLink').href = C.chain.blockExplorerUrls[0] + '/token/' + C.token.address;
    $('#caLink').title = C.token.address + ' (click to copy)';
    $('#caLink').addEventListener('click', (ev) => {
      ev.preventDefault();
      navigator.clipboard && navigator.clipboard.writeText(C.token.address);
      toast('Contract address copied');
      window.open(C.chain.blockExplorerUrls[0] + '/token/' + C.token.address, '_blank');
    });
  }

  /* ---------------- mobile tab bar ---------------- */
  const mnav = document.createElement('nav');
  mnav.className = 'mtabs';
  mnav.innerHTML = [...$$('.topbar .tab')].map((t) => `<button class="tab ${t.classList.contains('active') ? 'active' : ''}" data-view="${t.dataset.view}">${t.textContent}</button>`).join('');
  document.body.appendChild(mnav);
  mnav.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  const _show = show;
  show = function (v) { _show(v); mnav.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === v)); };

  /* ---------------- support widget ---------------- */
  function renderSupport() {
    const fab = $('#supportFab'), pop = $('#supportPop');
    const s = C.support || {};
    const links = [];
    if (s.telegramUrl) links.push(`<a href="${s.telegramUrl}" target="_blank" rel="noopener">✈ Telegram</a>`);
    if (s.discordUrl) links.push(`<a href="${s.discordUrl}" target="_blank" rel="noopener">💬 Discord</a>`);
    if (s.xUrl) links.push(`<a href="${s.xUrl}" target="_blank" rel="noopener">𝕏 Twitter / X</a>`);
    if (s.email) links.push(`<a href="mailto:${s.email}">✉ ${s.email}</a>`);
    if (!links.length) links.push(
      `<button id="spCopyCA">⧉ Copy $DSTOCK contract</button>`,
      `<a href="https://testnet.vibevibe.fun/" target="_blank" rel="noopener">↗ Vibe/Vibe launchpad</a>`,
      `<a href="${C.chain.blockExplorerUrls[0]}/token/${C.token.address}" target="_blank" rel="noopener">⛃ Token on explorer</a>`);
    $('#spLinks').innerHTML = links.join('');
    fab.addEventListener('click', () => { pop.hidden = !pop.hidden; });
    document.addEventListener('click', (e) => {
      if (!pop.hidden && !pop.contains(e.target) && !fab.contains(e.target)) pop.hidden = true;
    });
    const cc = $('#spCopyCA');
    if (cc) cc.addEventListener('click', () => {
      navigator.clipboard && navigator.clipboard.writeText(C.token.address);
      toast('Contract copied'); pop.hidden = true;
    });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    renderSwap(); renderDist(); renderRwa(); renderCA(); renderWalletModal(); renderSupport();
    await loadTokenMeta();
    renderHero(); refreshPortfolio();
    if (eth()) {
      try {
        const a = await eth().request({ method: 'eth_accounts' });
        if (a && a[0]) { account = a[0]; renderConnect(); refreshPortfolio(); }
      } catch (e) {}
    }
  }
  boot();
})();
