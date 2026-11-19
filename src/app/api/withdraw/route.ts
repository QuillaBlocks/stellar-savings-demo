import { NextResponse } from "next/server";
import { SupportedNetworks } from "@defindex/sdk";
import { toStroops, VAULT_ADDRESS } from "@/lib/config";
import { defindex } from "@/lib/sdks";

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  try {
    const { xdr } = await defindex.withdrawFromVault(
      VAULT_ADDRESS,
      { caller: address, amounts: [toStroops(amount)], slippageBps: 100 },
      SupportedNetworks.TESTNET,
    );
    return NextResponse.json({ xdr });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
