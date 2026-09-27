/* ============================================================
   dStock — config
   Edit nilai di sini tanpa menyentuh app.js
   ============================================================ */
window.DSTOCK_CONFIG = {
  projectName: "dStock",
  tagline: "Hold $DSTOCK. Earn stocks.",
  blurb: "A fee-funded treasury on Robinhood Chain testnet distributes tokenized RWA stocks (AAPL, NVDA, TSLA, AMD…) pro-rata to eligible $DSTOCK holders.",
  utility: "Stocks earned by eligible $DSTOCK holders.",

  // ---- chain ----
  chain: {
    chainId: 46630,
    chainIdHex: "0xb626",
    chainName: "Robinhood Chain Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.chain.robinhood.com"],
    blockExplorerUrls: ["https://explorer.testnet.chain.robinhood.com"],
  },

  // ---- token ----
  token: {
    address: "0x660F889D228379f742e4ad6CE11079aB355578F8",
    symbol: "DSTOCK",
    name: "DAO Stocks",
    decimals: 18,
    // Blockscout API dipakai sebagai fallback read-only (CORS-friendly):
    explorerApi: "https://explorer.testnet.chain.robinhood.com/api/v2",
    // Data on-chain terverifikasi (via Blockscout, 24 Sep 2026) — dipakai kalau RPC/explorer nggak terjangkau dari jaringan user:
    fallback: { holders: 30, totalSupply: 1000000000, transfers: 70 },
  },

  // ---- economics (mock on testnet; swap for real contract reads on mainnet) ----
  treasury: {
    feePercentLabel: "1.5%",
    feeAssetLabel: "ETH",
    totalDistributedUSD: 48310.55,
    feesCollectedETH: 12.84,
    distributionIntervalHours: 24,
  },
  eligibility: {
    minHoldTokens: 10000,
    minHoldLabel: "10,000 $DSTOCK",
  },
  swap: {
    // ---- isi alamat ini pas pool/router-nya jadi ----
    routerAddress: "",   // mis. "0x…" V2-style router di Robinhood testnet
    wethAddress: "",     // mis. "0x…" WETH/quote token testnet
    pathSymbols: ["WETH", "DSTOCK"],
    feeTier: "0.3%",
    routerNote: "Router address coming soon — swap tab wires to the on-chain pool once deployed.",
    // routerAddress: "0x…", // fill when ready
    poolTokenIn: "WETH",
  },
  // ---- wallet providers shown in the connect modal ----
  wallet: {
    privyAppId: "", // isi App ID Privy (privy.io) utk tombol Google/X; kosong = tombol social tampil "soon"
    providers: [
      { id: "metamask",      name: "MetaMask",       color: "#f6851b", install: "https://metamask.io/download/" },
      { id: "rabby",         name: "Rabby",          color: "#9772ff", install: "https://rabby.io/" },
      { id: "coinbase",      name: "Coinbase Wallet",color: "#0052ff", install: "https://www.coinbase.com/wallet" },
      { id: "trust",         name: "Trust Wallet",   color: "#2b75cd", install: "https://www.trustwallet.com/" },
      { id: "binance",       name: "Binance Wallet", color: "#f0b90b", install: "https://web3.binance.com/" },
      { id: "okx",           name: "OKX Wallet",     color: "#ffffff", install: "https://www.okx.com/web3" },
      { id: "walletconnect", name: "WalletConnect",  color: "#3b99fc", install: "https://walletconnect.com/" },
    ],
    socials: ["Google", "X (Twitter)"],
  },
  // ---- support widget (pojok kanan bawah) ----
  support: {
    label: "Need help?",
    telegramUrl: "",   // mis. "https://t.me/…"
    xUrl: "",          // mis. "https://x.com/…"
    email: "",         // mis. "builder@daostock.xyz"
    discordUrl: "",    // mis. "https://discord.gg/…"
  },
  stocks: [
    { ticker: "AAPL", name: "Apple",      price: 234.50 },
    { ticker: "NVDA", name: "NVIDIA",     price: 181.30 },
    { ticker: "TSLA", name: "Tesla",      price: 402.15 },
    { ticker: "AMD",  name: "AMD",        price: 161.20 },
    { ticker: "MSFT", name: "Microsoft",  price: 538.40 },
    { ticker: "AMZN", name: "Amazon",     price: 223.60 },
    { ticker: "GOOGL",name: "Alphabet",   price: 198.75 },
    { ticker: "META", name: "Meta",       price: 712.30 },
  ],
  distributionFeed: [
    { date: "2026-09-24", items: [["AAPL", 12.44], ["NVDA", 9.80], ["TSLA", 7.15], ["AMD", 5.02]] },
    { date: "2026-09-23", items: [["AAPL", 11.92], ["NVDA", 10.14], ["TSLA", 6.88], ["MSFT", 4.31]] },
    { date: "2026-09-22", items: [["AAPL", 12.10], ["NVDA", 9.55],  ["TSLA", 7.44], ["AMZN", 4.98]] },
    { date: "2026-09-21", items: [["AAPL", 11.68], ["NVDA", 9.92],  ["META", 3.11], ["AMD", 4.77]] },
  ],
  socials: { x: "https://x.com/", docs: "#", apply: "https://testnet.vibevibe.fun/" },
};
