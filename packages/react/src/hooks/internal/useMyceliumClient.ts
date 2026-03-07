"use client";

import type { MyceliumClient } from "@mycelium-ip/core-sdk";
import { useMyceliumContext } from "./useMyceliumContext";

/**
 * Returns the MyceliumClient instance from context, or null when the wallet
 * is not yet connected.
 *
 * @throws Error if used outside of MyceliumIpProvider
 *
 * @example
 * ```ts
 * const client = useMyceliumClient();
 * if (client) {
 *   const ix = await client.ipCore.entity.createIx({ ... });
 * }
 * ```
 */
export function useMyceliumClient(): MyceliumClient | null {
  const { client } = useMyceliumContext();
  return client;
}
