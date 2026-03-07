import type { MyceliumClient } from "@mycelium-ip/core-sdk";
import type { Commitment, Connection } from "@solana/web3.js";
import { createContext } from "react";
import type { MyceliumWallet } from "../types/wallet";

/**
 * Context value provided by MyceliumIpProvider.
 */
export interface MyceliumContextValue {
  /** Solana RPC connection */
  connection: Connection;
  /** Wallet implementing the MyceliumWallet interface, or null when not connected */
  wallet: MyceliumWallet | null;
  /** Core SDK client instance, or null when wallet is not connected */
  client: MyceliumClient | null;
  /** Transaction confirmation level */
  confirmation: Commitment;
}

/**
 * React context for Mycelium SDK.
 * @internal
 */
export const MyceliumContext = createContext<MyceliumContextValue | null>(null);
