"use client";

import { useEffect, useState } from "react";
import { AmountAction, Card } from "./card";
import { post, signAndSubmit } from "@/lib/api";

type Track = (label: string, action: () => Promise<{ hash?: string } | void>) => Promise<void>;

export function SwapCard({
  address,
  hasTrustline,
  xlm,
  track,
}: {
  address: string;
  hasTrustline: boolean;
  xlm: number;
  track: Track;
}) {
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<number | null>(null);

  useEffect(() => {
    setQuote(null);
    if (!Number(amount)) return;
    const timer = setTimeout(async () => {
      const response = await fetch(`/api/quote?amount=${amount}`);
      if (response.ok) setQuote((await response.json()).amountOut);
    }, 400);
    return () => clearTimeout(timer);
  }, [amount]);

  return (
    <Card title="1. Swap XLM to USDC · Soroswap">
      {hasTrustline ? (
        <AmountAction
          label="Swap"
          unit="XLM"
          max={Math.max(xlm - 5, 0)}
          onAmountChange={setAmount}
          hint={
            Number(amount) ? (
              quote === null ? (
                "Getting quote…"
              ) : (
                <>
                  You receive ≈ <span className="font-semibold text-[#fed400]">{quote.toFixed(4)} USDC</span>
                </>
              )
            ) : undefined
          }
          onSubmit={(value) =>
            track(`Swap ${value} XLM to USDC`, async () => {
              const { xdr } = await post<{ xdr: string }>("/api/swap", { address, amount: value });
              return signAndSubmit(xdr, address);
            })
          }
        />
      ) : (
        <button
          className="rounded-xl bg-[#2ec4b0] px-4 py-3 font-semibold text-[#121329]"
          onClick={() =>
            track("Add USDC trustline", async () => {
              const { xdr } = await post<{ xdr: string }>("/api/trustline", { address });
              return signAndSubmit(xdr, address);
            })
          }
        >
          Add USDC trustline
        </button>
      )}
    </Card>
  );
}
