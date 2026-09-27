# dStock — DApp (Vibe/Vibe Builder Role submission)

**Utility:** Stocks earned by eligible $DSTOCK holders.

Template DApp terinspirasi theindex.finance, dibangun untuk **Robinhood Chain Testnet (chain ID 46630)** —
jaringan tempat **Vibe/Vibe testnet launchpad** (testnet.vibevibe.fun) berjalan.

## Token
| | |
|---|---|
| Name | DAO Stocks |
| Symbol | $DSTOCK |
| CA | `0x660F889D228379f742e4ad6CE11079aB355578F8` |
| Explorer | https://explorer.testnet.chain.robinhood.com/token/0x660F889D228379f742e4ad6CE11079aB355578F8 |
| Supply | 1,000,000,000 (18 dec) — diverifikasi on-chain |

## Fitur (4 tab)
- **SWAP** — form ETH → $DSTOCK dengan live quote + fee 1.5% ke treasury. Tombol siap-wire ke router/pool on-chain (`config.js → swap.routerAddress`).
- **PORTFOLIO** — connect wallet (EIP-1193, auto-switch chain 46630), baca balance $DSTOCK live dari Blockscout API, hitung share of supply + estimasi stocks earned, kartu **eligibility** (≥ 10,000 $DSTOCK).
- **DISTRIBUTIONS** — mekanisme 3 langkah (fee → treasury beli saham → pro-rata epoch), countdown epoch berikutnya (UTC midnight cadence), feed distribusi AAPL/NVDA/TSLA/AMD dll.
- **RWA** — grid saham yang didukung (AAPL, NVDA, TSLA, AMD, MSFT, AMZN, GOOGL, META) + disclaimer testnet.

Design: dark fintech ala theindex.finance (Space Grotesk + IBM Plex Mono), responsive + mobile bottom-nav, zero build step (vanilla JS).

## Struktur
```
dstock/
├── index.html   # markup + tab views
├── style.css    # tema
├── config.js    # SEMUA parameter project (CA, chain, ekonomi, saham, feed)
└── app.js       # logika: wallet, quotes, API Blockscout + fallback data terverifikasi
```

## Jalankan lokal
```bash
cd dstock
python3 -m http.server 8080
# buka http://localhost:8080
```

## Deploy (buat apply builder role)
Paling gampang, salah satu dari:
```bash
npx vercel --prod            # dapat URL *.vercel.app permanen
# atau
npx serve dstock             # lokal
# atau drag folder ke https://app.netlify.com/drop
```
Deploy dulu, baru isi form apply builder di testnet.vibevibe.fun dengan URL live-nya + nama project "dStock" + utility "Stocks earned by eligible $DSTOCK holders".

## Catatan penting
- **Data mock vs on-chain:** harga, distribusi, dan ekonomi treasury masih mock (testnet). Holder/supply/CA sudah on-chain-accurate. Ganti angka di `config.js` kapan pun; begitu router pool & kontrak distributor jadi, `app.js` tinggal diarahkan ke `eth_call` asli.
- **Jaringan Indonesia:** RPC/explorer Robinhood sering diblok ISP (connection refused). App sudah graceful: pakai fallback data + connect wallet tetap jalan (via injected wallet). Kalau mau live-data dari browser yang sama, pakai VPN atau deploy ke Vercel (server-side tidak kena blokir ISP lokal).
- Semua angka testnet tidak punya nilai moneter, sesuai User Agreement Vibe/Vibe.

## To-do saat kontrak asli jadi
1. `config.js → swap.routerAddress` = alamat router/pool
2. Ganti `RATE`/quotes di `app.js` dengan `eth_call` ke pool
3. Tambah fungsi **claim** di tab Distributions (kontrak distributor)
4. Ganti feed & harga oracle dari kontrak treasury
