import { NextResponse } from "next/server";
import { horizon } from "@/lib/stellar";

export async function POST(request: Request) {
  const { address } = await request.json();
  try {
    await horizon.friendbot(address).call();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
