"use client";

import type { MyceliumWallet } from "../../types/wallet";
import { useMyceliumContext } from "./useMyceliumContext";

export interface UseMyceliumWalletResult {
  wallet: MyceliumWallet | null;
  isConnected: boolean;
}

/**
 * Returns the MyceliumWallet from context and a connection status flag.
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
  const isConnected = wallet !== null && wallet.publicKey !== null;
  return { wallet, isConnected };
}
