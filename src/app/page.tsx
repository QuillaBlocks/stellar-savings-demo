"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/card";
import { EXPLORER_URL } from "@/lib/config";
import { post } from "@/lib/api";
import { connectWallet, disconnectWallet } from "@/lib/wallet";

export type Balances = {
  funded: boolean;
  xlm: number;
};

export type Activity = { label: string; hash?: string; error?: string };

export default function Home() {
  const [address, setAddress] = useState<string>();
  const [balances, setBalances] = useState<Balances>();
  const [activity, setActivity] = useState<Activity[]>([]);

  const refresh = useCallback(async () => {
    if (!address) return;
    const response = await fetch(`/api/balances?address=${address}`);
    setBalances(await response.json());
  }, [address]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const track = useCallback(
    async (label: string, action: () => Promise<{ hash?: string } | void>) => {
      try {
        const result = await action();
        setActivity((items) => [{ label, hash: result?.hash }, ...items]);
      } catch (error) {
        setActivity((items) => [{ label, error: (error as Error).message }, ...items]);
      } finally {
        await refresh();
      }
    },
    [refresh],
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-4 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#2ec4b0]">Stellar testnet</p>
        <h1 className="text-3xl font-bold text-[#f5f3ee]">Savings demo</h1>
        <p className="text-[#c5c9dd]">Swap XLM to USDC and earn yield, without writing a single contract.</p>
      </header>

      <Card title="Wallet">
        {address ? (
          <div className="flex flex-col gap-3">
            <p className="break-all font-mono text-sm text-[#c5c9dd]">{address}</p>
            <div className="flex gap-3">
              {balances && !balances.funded && (
                <button
                  className="rounded-xl bg-[#2ec4b0] px-4 py-2 font-semibold text-[#121329]"
                  onClick={() => track("Fund with Friendbot", () => post("/api/friendbot", { address }))}
                >
                  Fund with Friendbot
                </button>
              )}
              <button
                className="rounded-xl border border-[#333a6b] px-4 py-2 text-[#c5c9dd]"
                onClick={async () => {
                  await disconnectWallet();
                  setAddress(undefined);
                  setBalances(undefined);
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            className="rounded-xl bg-[#fed400] px-4 py-3 font-semibold text-[#121329]"
            onClick={async () => setAddress(await connectWallet())}
          >
            Connect wallet
          </button>
        )}
      </Card>

      {balances?.funded && (
        <Card title="Balances">
          <dl className="grid grid-cols-2 gap-3">
            <Balance label="XLM" value={balances.xlm} />
          </dl>
        </Card>
      )}

      {activity.length > 0 && (
        <Card title="Activity">
          <ul className="flex flex-col gap-2 text-sm">
            {activity.map((item, index) => (
              <li key={index} className="flex justify-between gap-3">
                <span className="text-[#f5f3ee]">{item.label}</span>
                {item.hash ? (
                  <a className="text-[#2ec4b0] underline" href={`${EXPLORER_URL}/tx/${item.hash}`} target="_blank">
                    View transaction
                  </a>
                ) : item.error ? (
                  <span className="truncate text-[#ff6b70]" title={item.error}>{item.error}</span>
                ) : (
                  <span className="text-[#2ec4b0]">Done</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}

function Balance({ label, value, precise }: { label: string; value: number; precise?: boolean }) {
  return (
    <div className="rounded-xl bg-[#121329] p-4">
      <dt className="text-sm text-[#8e94b8]">{label}</dt>
      <dd className="text-2xl font-semibold text-[#f5f3ee]">{value.toLocaleString(undefined, precise ? { minimumFractionDigits: 7, maximumFractionDigits: 7 } : { maximumFractionDigits: 4 })}</dd>
    </div>
  );
}
