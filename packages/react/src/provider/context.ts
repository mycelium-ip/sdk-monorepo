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
  /** Wallet implementing the MyceliumWallet interface */
  wallet: MyceliumWallet;
  /** Core SDK client instance */
  client: MyceliumClient;
  /** Transaction confirmation level */
  confirmation: Commitment;
}

/**
 * React context for Mycelium SDK.
 * @internal
 */
export const MyceliumContext = createContext<MyceliumContextValue | null>(null);
