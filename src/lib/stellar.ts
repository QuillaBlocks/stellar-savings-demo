import "server-only";
import { Horizon, rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { HORIZON_URL, NETWORK_PASSPHRASE, RPC_URL } from "./config";

export const horizon = new Horizon.Server(HORIZON_URL);
export const sorobanRpc = new rpc.Server(RPC_URL);

export async function loadBalances(address: string) {
  try {
    const account = await horizon.loadAccount(address);
    return account.balances;
  } catch {
    return null;
  }
}

export async function submitTransaction(signedXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sent = await sorobanRpc.sendTransaction(tx);
  if (sent.status === "ERROR") {
    throw new Error(`Transaction rejected: ${sent.errorResult?.toXDR("base64") ?? "unknown error"}`);
  }

  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await sorobanRpc.getTransaction(sent.hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return { hash: sent.hash };
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${sent.hash}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Transaction not confirmed: ${sent.hash}`);
}
