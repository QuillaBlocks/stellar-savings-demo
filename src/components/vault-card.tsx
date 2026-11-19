"use client";

import { AmountAction, Card } from "./card";
import { post, signAndSubmit } from "@/lib/api";

type Track = (label: string, action: () => Promise<{ hash?: string } | void>) => Promise<void>;

export function VaultCard({
  address,
  apy,
  usdc,
  vault,
  track,
}: {
  address: string;
  apy: number;
  usdc: number;
  vault: number;
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
      <AmountAction
        label="Withdraw"
        unit="USDC"
        max={vault}
        disabled={vault <= 0}
        onSubmit={(amount) =>
          track(`Withdraw ${amount} USDC`, async () => {
            const { xdr } = await post<{ xdr: string }>("/api/withdraw", { address, amount });
            return signAndSubmit(xdr, address);
          })
        }
      />
    </Card>
  );
}
