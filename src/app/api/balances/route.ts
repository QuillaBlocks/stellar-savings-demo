import { NextResponse } from "next/server";
import { loadBalances } from "@/lib/stellar";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const balances = await loadBalances(address);
  if (!balances) {
    return NextResponse.json({ funded: false, xlm: 0 });
  }

  const native = balances.find((b) => b.asset_type === "native");

  return NextResponse.json({
    funded: true,
    xlm: Number(native?.balance ?? 0),
  });
}
