"use client";

import { NETWORK_PASSPHRASE } from "./config";

let initialized = false;

async function kit() {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit/sdk");
  if (!initialized) {
    const { defaultModules } = await import("@creit.tech/stellar-wallets-kit/modules/utils");
    const { Networks } = await import("@creit.tech/stellar-wallets-kit/types");
    StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET });
    initialized = true;
  }
  return StellarWalletsKit;
}

export async function connectWallet() {
  const swk = await kit();
  const { address } = await swk.authModal();
  return address;
}

export async function disconnectWallet() {
  const swk = await kit();
  await swk.disconnect();
}

export async function signTransaction(xdr: string, address: string) {
  const swk = await kit();
  const { signedTxXdr } = await swk.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  return signedTxXdr;
}
