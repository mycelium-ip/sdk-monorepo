import type { Transaction } from "@solana/web3.js";

export type {
  StandardWalletWrapper,
  UnsupportedFeatureError,
} from "@mycelium-ip/core-sdk";

/**
 * Custom transaction executor that replaces the default sign → send flow.
 *
 * Receives a fully-built unsigned `Transaction` (blockhash and feePayer are
 * already set) and must sign, send, and return the resulting signature.
 *
 * The SDK still calls `confirmTransaction` after this returns.
 *
 * @example
 * ```tsx
 * // Privy sponsored transaction
 * const executeTransaction: TransactionExecutor = async (tx) => {
 *   const { hash } = await signAndSendTransaction({
 *     transaction: tx,
 *     options: { sponsor: true },
 *   });
 *   return { signature: hash };
 * };
 * ```
 */
export type TransactionExecutor = (
  transaction: Transaction,
) => Promise<{ signature: string }>;
