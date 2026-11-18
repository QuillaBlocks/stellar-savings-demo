import { NextResponse } from "next/server";
import { SupportedNetworks, SupportedProtocols, TradeType } from "@soroswap/sdk";
import { fromStroops, toStroops, USDC_CONTRACT, XLM_CONTRACT } from "@/lib/config";
import { soroswap } from "@/lib/sdks";

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  try {
    const quote = await soroswap.quote(
      {
        assetIn: XLM_CONTRACT,
        assetOut: USDC_CONTRACT,
        amount: BigInt(toStroops(amount)),
        tradeType: TradeType.EXACT_IN,
        protocols: [SupportedProtocols.SOROSWAP],
        slippageBps: 100,
      },
      SupportedNetworks.TESTNET,
    );
    const { xdr } = await soroswap.build({ quote, from: address }, SupportedNetworks.TESTNET);
    return NextResponse.json({ xdr, amountOut: fromStroops(String(quote.amountOut)) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
