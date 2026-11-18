"use client";

import { AmountAction, Card } from "./card";
import { post, signAndSubmit } from "@/lib/api";

type Track = (label: string, action: () => Promise<{ hash?: string } | void>) => Promise<void>;

export function VaultCard({
  address,
  apy,
  usdc,
  track,
}: {
  address: string;
  apy: number;
  usdc: number;
  track: Track;
}) {
  return (
    <Card title="2. Earn yield · DeFindex vault on Blend">
      <p className="text-sm text-[#c5c9dd]">
        Current APY: <span className="font-semibold text-[#fed400]">{apy.toFixed(2)}%</span>
      </p>
      <AmountAction
        label="Deposit"
        unit="USDC"
        max={usdc}
        onSubmit={(amount) =>
          track(`Deposit ${amount} USDC`, async () => {
            const { xdr } = await post<{ xdr: string }>("/api/deposit", { address, amount });
            return signAndSubmit(xdr, address);
          })
        }
      />
    </Card>
  );
}
