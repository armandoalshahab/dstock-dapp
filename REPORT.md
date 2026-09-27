# dStock — Builder Role Application Report
### Project for Vibe/Vibe Testnet · Robinhood Chain (chain ID 46630)

---

## 1. One-liner
**dStock (DAO Stocks)** — a The-Index-inspired index-token DApp where **$DSTOCK holders earn pro-rata distributions of tokenized RWA equities (AAPL, NVDA, TSLA, AMD, MSFT, AMZN, GOOGL, META)** funded by protocol swap fees.

> **Utility:** Stocks earned by eligible $DSTOCK holders.

## 2. Links
| | |
|---|---|
| Website | https://daostock.netlify.app/ |
| Token CA | `0x660F889D228379f742e4ad6CE11079aB355578F8` |
| Explorer page | https://explorer.testnet.chain.robinhood.com/token/0x660F889D228379f742e4ad6CE11079aB355578F8 |
| Network | Robinhood Chain Testnet · chain ID 46630 · RPC `https://rpc.testnet.chain.robinhood.com` |
| Launchpad | https://testnet.vibevibe.fun/ (Vibe/Vibe builder program) |

## 3. What dStock is
dStock is a **synthetic stock index on a chain**. The design takes the proven model of The Index (index token backed by a basket of traditional-equity RWAs, with fee-funded distributions to holders) and brings it to the Robinhood Chain testnet as a builder project for the Vibe/Vibe launchpad.

Holders do nothing but **hold**. Every swap through the dStock router pays a **1.5% protocol fee** into a treasury; the treasury accumulates those fees and buys into the RWA stock basket; at each **distribution epoch**, the basket's gains are allocated **pro-rata by holding weight** to eligible wallets (minimum 10,000 $DSTOCK — 0.001% of supply).

### The DApp (4 tabs)
1. **SWAP** — buy $DSTOCK with ETH through a configurable on-chain router (V2-style `swapExactETHForTokens` call, 5% slippage protection, 20-minute deadline). The router address is a UI field, so the DApp goes live the second the pool is deployed — no frontend redeploy needed.
2. **PORTFOLIO** — wallet connect (MetaMask/Rabby/Coinbase/Trust/Binance/OKX/WalletConnect modal + Google/X social login hooks), live on-chain $DSTOCK balance, share-of-supply, estimated stocks earned, and a green **eligibility card** that flips once the wallet qualifies for distributions.
3. **DISTRIBUTIONS** — the 3-step mechanism explained on-chain terms, a countdown to the next daily epoch (UTC), and a distribution feed showing which stocks (AAPL/NVDA/TSLA/AMD…) were credited.
4. **RWA** — the basket: 8 blue-chip tickers with indicative prices and the testnet disclaimer.

## 4. How to buy $DSTOCK (user flow)
1. Open https://daostock.netlify.app/ and press **CONNECT** → pick a wallet (MetaMask, Rabby, OKX, Coinbase, Binance, Trust, or WalletConnect).
2. The DApp auto-switches the wallet to **Robinhood Chain Testnet (46630)**; if the chain isn't added yet, it prompts `wallet_addEthereumChain` automatically.
3. Fund the wallet with testnet ETH (Robinhood Chain testnet faucet).
4. Go to the **SWAP** tab → enter an ETH amount → live quote shows the $DSTOCK you'll receive and the 1.5% fee routed to the treasury.
5. Paste the pool/router address into the **ROUTER** field (one-time; stored locally) → **SWAP** → confirm in wallet.
6. Tokens land in the wallet. Open **PORTFOLIO** to see balance, supply share, and whether you cross the 10,000 $DSTOCK eligibility line.

## 5. Token facts (verified on-chain via Blockscout, 24 Sep 2026)
| | |
|---|---|
| Name / symbol | DAO Stocks / $DSTOCK |
| Contract | 0x660F889D228379f742e4ad6CE11079aB355578F8 |
| Standard | ERC-20, 18 decimals |
| Total supply | 1,000,000,000 |
| Holders | 30 |
| Transfers | 70 |
| Distribution eligibility | ≥ 10,000 $DSTOCK |
| Protocol fee | 1.5% of every swap → treasury |
| Distribution cadence | daily epochs (UTC) |

## 6. Why this fits Vibe/Vibe (insights)
- **Robinhood-native narrative.** Robinhood Chain's whole identity is bridging TradFi equities on-chain. An RWA stock-index token is the most on-theme project the launchpad can host — it markets the chain's core use-case, not just a degen token.
- **Fee flywheel from day one.** The only emission path is protocol fees from swaps → treasury → stock basket → holders. That creates a real reason to *hold* (not just *buy*), which is exactly what an early testnet ecosystem needs to retain wallets.
- **Proven design, not invented risk.** The Index (theindex.finance) demonstrated the model — index token + RWA basket + distributions — at real scale. dStock adapts mechanics that already survived mainnet, de-risked on testnet.
- **Holder-experience first.** The eligibility card, countdown, and distribution feed turn an invisible pro-rata mechanic into something users *feel* daily — retention loops matter for launchpad leaderboard activity.
- **Ships-ready architecture.** The router address, WETH path, fee %, and eligibility threshold are all config-driven. When official Vibe/Vibe pool contracts exist, dStock wires in without a rebuild; when the distributor contract is ready, the claim tab drops straight in.

## 7. Honest status (testnet)
- Live: full frontend, wallet connect, eligibility engine, verified token data, working swap-transaction encoding.
- Currently mock/indicative on testnet: stock prices, treasury numbers, distribution feed (no real RWA settlement on a testnet). These are placeholders awaiting the real contracts.
- Next when contracts land: 1) point swap at the deployed pool, 2) distributor contract + claim UI in the Distributions tab, 3) oracle for basket prices.
- Network note: Robinhood Chain explorer/RPC can be unreachable from some regions (e.g. Indonesian ISPs); the DApp handles this gracefully with cached verified data and wallet-based reads.

---
*dStock — hold the stock index, earn it. Built for the Vibe/Vibe testnet launchpad on Robinhood Chain.*
