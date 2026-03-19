"use client";

import type { MetadataAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single metadata account by address.
 *
 * @example
 * ```tsx
 * function MetadataDetails({ address }: { address: string }) {
 *   const { data, isLoading } = useMetadata(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!data) return <p>Metadata not found</p>;
 *
 *   return <p>Revision: {data.revision.toString()}</p>;
 * }
 * ```
 */
export function useMetadata(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<MetadataAccount | null, Error>({
    queryKey: queryKeys.metadataAccount(address ?? ""),
    queryFn: () => client!.ipCore.fetchMetadata(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
