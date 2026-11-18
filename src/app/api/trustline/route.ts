import { NextResponse } from "next/server";
import { BASE_FEE, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, USDC } from "@/lib/config";
import { horizon } from "@/lib/stellar";

export async function POST(request: Request) {
  const { address } = await request.json();
  const account = await horizon.loadAccount(address);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.changeTrust({ asset: USDC }))
    .setTimeout(300)
    .build();
  return NextResponse.json({ xdr: tx.toXDR() });
}
