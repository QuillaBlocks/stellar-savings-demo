"use client";

import { signTransaction } from "./wallet";

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export async function signAndSubmit(xdr: string, address: string) {
  const signed = await signTransaction(xdr, address);
  return post<{ hash: string }>("/api/submit", { xdr: signed });
}
