import { NextResponse } from "next/server";
import { USDC } from "@/lib/config";
import { loadBalances } from "@/lib/stellar";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const balances = await loadBalances(address);
  if (!balances) {
    return NextResponse.json({ funded: false, xlm: 0, usdc: 0, hasTrustline: false });
  }

  const native = balances.find((b) => b.asset_type === "native");
  const usdc = balances.find(
    (b) => "asset_code" in b && b.asset_code === USDC.code && b.asset_issuer === USDC.issuer,
  );

  return NextResponse.json({
    funded: true,
    xlm: Number(native?.balance ?? 0),
    usdc: Number(usdc?.balance ?? 0),
    hasTrustline: Boolean(usdc),
  });
}
