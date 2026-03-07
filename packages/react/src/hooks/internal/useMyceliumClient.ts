"use client";

import type { MyceliumClient } from "@mycelium-ip/core-sdk";
import { useMyceliumContext } from "./useMyceliumContext";

/**
 * Returns the MyceliumClient instance from context.
 *
 * @throws Error if used outside of MyceliumIpProvider
 * @throws Error if wallet is not connected
 *
 * @example
 * ```ts
 * const client = useMyceliumClient();
 * const ix = await client.ipCore.entity.createIx({ ... });
 * ```
 */
export function useMyceliumClient(): MyceliumClient {
  const { client } = useMyceliumContext();
  return client;
}
