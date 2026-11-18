import "server-only";
import { Account, Address, Contract, nativeToScVal, rpc, scValToNative, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { fromStroops, NETWORK_PASSPHRASE, VAULT_ADDRESS } from "./config";
import { sorobanRpc } from "./stellar";

async function read(address: string, method: string, ...args: xdr.ScVal[]) {
  const tx = new TransactionBuilder(new Account(address, "0"), { fee: "100", networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(new Contract(VAULT_ADDRESS).call(method, ...args))
    .setTimeout(30)
    .build();
  const result = await sorobanRpc.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(result) || !result.result) throw new Error(`Cannot read ${method}`);
  return scValToNative(result.result.retval);
}

export async function vaultBalance(address: string) {
  const shares: bigint = await read(address, "balance", new Address(address).toScVal());
  if (shares === BigInt(0)) return 0;
  const [usdc]: bigint[] = await read(address, "get_asset_amounts_per_shares", nativeToScVal(shares, { type: "i128" }));
  return fromStroops(usdc);
}
