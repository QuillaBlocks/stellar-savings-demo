import "server-only";
import { SoroswapSDK, SupportedNetworks } from "@soroswap/sdk";

export const soroswap = new SoroswapSDK({
  apiKey: process.env.SOROSWAP_API_KEY!,
  defaultNetwork: SupportedNetworks.TESTNET,
});
