import { NextResponse } from "next/server";
import { submitTransaction } from "@/lib/stellar";

export async function POST(request: Request) {
  const { xdr } = await request.json();
  try {
    const result = await submitTransaction(xdr);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
