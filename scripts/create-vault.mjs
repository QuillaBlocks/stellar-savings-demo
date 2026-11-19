import { readFileSync } from "node:fs";
import { DefindexSDK, SupportedNetworks as DefindexNetworks } from "@defindex/sdk";
import { SoroswapSDK, SupportedNetworks, SupportedProtocols, TradeType } from "@soroswap/sdk";
import { Asset, BASE_FEE, Horizon, Keypair, Networks, Operation, rpc, TransactionBuilder } from "@stellar/stellar-sdk";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const [key, ...value] = line.split("=");
  if (key && !process.env[key]) process.env[key] = value.join("=");
}

const USDC = new Asset("USDC", "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56");
const USDC_CONTRACT = USDC.contractId(Networks.TESTNET);
const XLM_CONTRACT = Asset.native().contractId(Networks.TESTNET);
const BLEND_USDC_STRATEGY = "CALLOM5I7XLQPPOPQMYAHUWW4N7O3JKT42KQ4ASEEVBXDJQNJOALFSUY";
const INITIAL_DEPOSIT = 10_0000000;

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const server = new rpc.Server("https://soroban-testnet.stellar.org");
const soroswap = new SoroswapSDK({ apiKey: process.env.SOROSWAP_API_KEY, defaultNetwork: SupportedNetworks.TESTNET });
const defindex = new DefindexSDK({ apiKey: process.env.DEFINDEX_API_KEY });

const manager = process.env.VAULT_MANAGER_SECRET
  ? Keypair.fromSecret(process.env.VAULT_MANAGER_SECRET)
  : Keypair.random();
const address = manager.publicKey();

async function submit(xdr) {
  const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
  tx.sign(manager);
  const sent = await server.sendTransaction(tx);
  if (sent.status === "ERROR") throw new Error(`Rejected: ${sent.errorResult?.toXDR("base64")}`);
  const result = await server.pollTransaction(sent.hash);
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) throw new Error(`Failed: ${sent.hash}`);
  return { hash: sent.hash, result };
}

console.log(`Manager: ${address}`);
if (!process.env.VAULT_MANAGER_SECRET) {
  console.log(`Add to .env.local: VAULT_MANAGER_SECRET=${manager.secret()}`);
}

await horizon.friendbot(address).call().catch(() => {});

const account = await horizon.loadAccount(address);
if (!account.balances.some((b) => b.asset_code === USDC.code && b.asset_issuer === USDC.issuer)) {
  const trust = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust({ asset: USDC }))
    .setTimeout(300)
    .build();
  await submit(trust.toXDR());
  console.log("USDC trustline added");
}

const quote = await soroswap.quote({
  assetIn: XLM_CONTRACT,
  assetOut: USDC_CONTRACT,
  amount: 200_0000000n,
  tradeType: TradeType.EXACT_IN,
  protocols: [SupportedProtocols.SOROSWAP],
  slippageBps: 100,
});
const { xdr: swapXdr } = await soroswap.build({ quote, from: address });
await submit(swapXdr);
console.log(`Swapped 200 XLM for ${Number(quote.amountOut) / 1e7} USDC`);

const vault = await defindex.createVaultAutoInvest(
  {
    caller: address,
    roles: { manager: address, emergencyManager: address, rebalanceManager: address, feeReceiver: address },
    name: "QuillaBlocks Savings",
    symbol: "qbUSDC",
    vaultFee: 100,
    upgradable: true,
    assets: [
      {
        address: USDC_CONTRACT,
        symbol: "USDC",
        amount: INITIAL_DEPOSIT,
        strategies: [{ address: BLEND_USDC_STRATEGY, name: "USDC Blend Strategy", amount: INITIAL_DEPOSIT }],
      },
    ],
  },
  DefindexNetworks.TESTNET,
);
const { hash } = await submit(vault.xdr);
console.log(`Vault created: ${vault.predictedVaultAddress}`);
console.log(`Transaction: https://stellar.expert/explorer/testnet/tx/${hash}`);
