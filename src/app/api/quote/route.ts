import { NextResponse } from "next/server";
import { SupportedNetworks, SupportedProtocols, TradeType } from "@soroswap/sdk";
import { fromStroops, toStroops, USDC_CONTRACT, XLM_CONTRACT } from "@/lib/config";
import { soroswap } from "@/lib/sdks";

export async function GET(request: Request) {
  const amount = new URL(request.url).searchParams.get("amount");
  if (!Number(amount)) {
    return NextResponse.json({ error: "Missing amount" }, { status: 400 });
  }
  try {
    const quote = await soroswap.quote(
      {
        assetIn: XLM_CONTRACT,
        assetOut: USDC_CONTRACT,
        amount: BigInt(toStroops(amount!)),
        tradeType: TradeType.EXACT_IN,
        protocols: [SupportedProtocols.SOROSWAP],
        slippageBps: 100,
      },
      SupportedNetworks.TESTNET,
    );
    return NextResponse.json({ amountOut: fromStroops(String(quote.amountOut)) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
