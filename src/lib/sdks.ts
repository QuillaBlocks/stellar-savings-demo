import "server-only";
import { DefindexSDK } from "@defindex/sdk";
import { SoroswapSDK, SupportedNetworks } from "@soroswap/sdk";

export const soroswap = new SoroswapSDK({
  apiKey: process.env.SOROSWAP_API_KEY!,
  defaultNetwork: SupportedNetworks.TESTNET,
});

export const defindex = new DefindexSDK({
  apiKey: process.env.DEFINDEX_API_KEY!,
});
