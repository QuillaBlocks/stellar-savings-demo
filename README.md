# Stellar Savings Demo

A savings app on Stellar testnet built only from existing ecosystem pieces, with zero custom contracts:

- **Stellar Wallets Kit** to connect any Stellar wallet.
- **Soroswap** to swap XLM to USDC.
- **DeFindex** to deposit USDC into a vault that lends it on **Blend** and earns yield.

```
Wallet ──▶ Soroswap (XLM → USDC) ──▶ DeFindex vault ──▶ Blend
```

The Soroswap and DeFindex SDKs run in Next.js API routes because they need API keys. Each route returns an unsigned transaction (XDR), the browser wallet signs it, and `/api/submit` sends it to Stellar RPC. The app never holds user keys.

Deposits call the vault contract directly with `invest = true`, so the USDC goes straight into the Blend strategy. The DeFindex API currently builds deposits with `invest = false`, which would leave the funds idle in the vault.

## Run it

```bash
cp .env.example .env.local   # add your API keys
npm install
npm run dev
```

- Soroswap API key: https://api.soroswap.finance
- DeFindex API key: https://console.defindex.io

Use a wallet set to **testnet** (Freighter, xBull, Lobstr, …). The app funds new accounts with Friendbot.

## Steps

Each step is a git tag, so you can follow the build one piece at a time:

| Tag | What it adds |
|---|---|
| `step-1-wallet` | Connect a wallet, fund it with Friendbot, show the XLM balance |
| `step-2-swap` | USDC trustline and XLM → USDC swap with Soroswap |
| `step-3-deposit` | Deposit USDC into the DeFindex USDC vault and show the APY |
| `step-4-withdraw` | Withdraw USDC from the vault |

```bash
git checkout step-2-swap
git diff step-1-wallet step-2-swap
```

## Create your own vault

`scripts/create-vault.mjs` creates the vault this demo uses. It funds a manager account with Friendbot, swaps 200 XLM to USDC on Soroswap and calls `createVaultAutoInvest` from `@defindex/sdk`, so the first 10 USDC go straight into the Blend strategy.

```bash
node scripts/create-vault.mjs
```

Create the vault with auto-invest: a vault invests new deposits in the same ratio it already has invested, so a vault that starts with nothing in its strategy never invests.

Strategy addresses: [`defindex-io/stellar-contracts/public/testnet.contracts.json`](https://github.com/defindex-io/stellar-contracts/blob/main/public/testnet.contracts.json).

## Testnet contracts

| | Address |
|---|---|
| USDC (SAC) | `CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU` |
| DeFindex vault (QuillaBlocks Savings, `qbUSDC`) | `CDNT6O5RWO7XU5Y6ZBYJTRIDJYUGV6FLGCFNOBC6TDEJGL2GUNFXCOK4` |
| Blend USDC strategy | `CALLOM5I7XLQPPOPQMYAHUWW4N7O3JKT42KQ4ASEEVBXDJQNJOALFSUY` |
