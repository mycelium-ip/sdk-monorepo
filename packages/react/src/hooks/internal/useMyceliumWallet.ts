"use client";

import type { MyceliumWallet } from "../../types/wallet";
import { useMyceliumContext } from "./useMyceliumContext";

/**
 * Returns the MyceliumWallet from context.
 *
 * @throws Error if used outside of MyceliumIpProvider
 *
 * @example
 * ```ts
 * const wallet = useMyceliumWallet();
 * const pubkey = wallet.publicKey;
 * ```
 */
export function useMyceliumWallet(): MyceliumWallet {
  const { wallet } = useMyceliumContext();
  return wallet;
}
