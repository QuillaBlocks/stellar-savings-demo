import { Asset, Networks } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const EXPLORER_URL = "https://stellar.expert/explorer/testnet";

export const XLM = Asset.native();
export const XLM_CONTRACT = XLM.contractId(NETWORK_PASSPHRASE);

export const USDC = new Asset("USDC", "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56");
export const USDC_CONTRACT = USDC.contractId(NETWORK_PASSPHRASE);

export const STROOPS = 10_000_000;

export const toStroops = (amount: string | number) =>
  Math.round(Number(amount) * STROOPS);

export const fromStroops = (amount: string | number | bigint) =>
  Number(amount) / STROOPS;
