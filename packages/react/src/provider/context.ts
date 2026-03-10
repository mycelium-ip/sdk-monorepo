import type {
  MyceliumClient,
  MyceliumCluster,
  StandardWalletWrapper,
} from "@mycelium-ip/core-sdk";
import type { Commitment, Connection } from "@solana/web3.js";
import { createContext } from "react";

/**
 * Context value provided by MyceliumIpProvider.
 */
export interface MyceliumContextValue {
  /** Solana RPC connection */
  connection: Connection;
  /** Wallet Standard wrapper, or null when not connected */
  wallet: StandardWalletWrapper | null;
  /** Core SDK client instance, or null when wallet is not connected */
  client: MyceliumClient | null;
  /** Transaction confirmation level */
  confirmation: Commitment;
  /** Target Solana cluster */
  cluster: MyceliumCluster;
}

/**
 * React context for Mycelium SDK.
 * @internal
 */
export const MyceliumContext = createContext<MyceliumContextValue | null>(null);
