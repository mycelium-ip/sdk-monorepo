"use client";

import type { StandardWalletWrapper } from "@mycelium-ip/core-sdk";
import { useMyceliumContext } from "./useMyceliumContext";

export interface UseMyceliumWalletResult {
  wallet: StandardWalletWrapper | null;
  isConnected: boolean;
}

/**
 * Returns the StandardWalletWrapper from context and a connection status flag.
 *
 * @throws Error if used outside of MyceliumIpProvider
 *
 * @example
 * ```ts
 * const { wallet, isConnected } = useMyceliumWallet();
 * if (isConnected) {
 *   console.log(wallet.publicKey.toBase58());
 * }
 * ```
 */
export function useMyceliumWallet(): UseMyceliumWalletResult {
  const { wallet } = useMyceliumContext();
  const isConnected = wallet !== null;
  return { wallet, isConnected };
}
