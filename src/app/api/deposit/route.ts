import { NextResponse } from "next/server";
import { Address, BASE_FEE, Contract, nativeToScVal, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, toStroops, VAULT_ADDRESS } from "@/lib/config";
import { sorobanRpc } from "@/lib/stellar";

const i128Vec = (values: number[]) => xdr.ScVal.scvVec(values.map((v) => nativeToScVal(v, { type: "i128" })));

// The DeFindex API builds deposits with invest=false, which leaves funds idle in the vault,
// so this calls the vault contract directly to invest into the Blend strategy on deposit.
export async function POST(request: Request) {
  const { address, amount } = await request.json();
  try {
    const stroops = toStroops(amount);
    const account = await sorobanRpc.getAccount(address);
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(
        new Contract(VAULT_ADDRESS).call(
          "deposit",
          i128Vec([stroops]),
          i128Vec([Math.floor(stroops * 0.99)]),
          new Address(address).toScVal(),
          nativeToScVal(true),
        ),
      )
      .setTimeout(300)
      .build();
    const prepared = await sorobanRpc.prepareTransaction(tx);
    return NextResponse.json({ xdr: prepared.toXDR() });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
