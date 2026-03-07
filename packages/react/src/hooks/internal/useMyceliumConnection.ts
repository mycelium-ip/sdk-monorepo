"use client";

import type { Connection } from "@solana/web3.js";
import { useMyceliumContext } from "./useMyceliumContext";

/**
 * Returns the Solana Connection from context.
 *
 * @throws Error if used outside of MyceliumIpProvider
 *
 * @example
 * ```ts
 * const connection = useMyceliumConnection();
 * const blockhash = await connection.getLatestBlockhash();
 * ```
 */
export function useMyceliumConnection(): Connection {
  const { connection } = useMyceliumContext();
  return connection;
}
