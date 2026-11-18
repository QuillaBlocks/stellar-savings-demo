"use client";

import { useState } from "react";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-[#1d2142] p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-[#f5f3ee]">{title}</h2>
      {children}
    </section>
  );
}

export function AmountAction({
  label,
  unit,
  disabled,
  max,
  hint,
  onAmountChange,
  onSubmit,
}: {
  label: string;
  unit: string;
  disabled?: boolean;
  max?: number;
  hint?: React.ReactNode;
  onAmountChange?: (amount: string) => void;
  onSubmit: (amount: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  function change(value: string) {
    setAmount(value);
    onAmountChange?.(value);
  }

  async function handle() {
    setBusy(true);
    try {
      await onSubmit(amount);
      change("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#121329] px-4">
          <input
            className="min-w-0 flex-1 bg-transparent py-3 text-[#f5f3ee] outline-none"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => change(e.target.value)}
          />
          {max !== undefined && (
            <button
              className="rounded-md bg-[#252a52] px-2 py-1 text-xs font-semibold text-[#2ec4b0] disabled:opacity-40"
              disabled={max <= 0}
              onClick={() => change(String(Math.floor(max * 1e7) / 1e7))}
            >
              Max
            </button>
          )}
          <span className="text-sm text-[#8e94b8]">{unit}</span>
        </div>
        <button
          className="rounded-xl bg-[#fed400] px-5 font-semibold text-[#121329] disabled:opacity-40"
          disabled={disabled || busy || !Number(amount)}
          onClick={handle}
        >
          {busy ? "Signing…" : label}
        </button>
      </div>
      {hint && <p className="px-1 text-sm text-[#8e94b8]">{hint}</p>}
    </div>
  );
}
