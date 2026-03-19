"use client";

import type { EntityAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single entity account by address.
 *
 * @example
 * ```tsx
 * function EntityDetails({ address }: { address: string }) {
 *   const { data, isLoading, error } = useEntity(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *   if (!data) return <p>Entity not found</p>;
 *
 *   return <p>Controller: {data.controller.toBase58()}</p>;
 * }
 * ```
 */
export function useEntity(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<EntityAccount | null, Error>({
    queryKey: queryKeys.entity(address ?? ""),
    queryFn: () => client!.ipCore.fetchEntity(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
