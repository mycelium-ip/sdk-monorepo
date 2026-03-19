"use client";

import type { IpAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single IP account by address.
 *
 * @example
 * ```tsx
 * function IpDetails({ address }: { address: string }) {
 *   const { data, isLoading, error } = useIp(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!data) return <p>IP not found</p>;
 *
 *   return <p>Owner: {data.currentOwnerEntity.toBase58()}</p>;
 * }
 * ```
 */
export function useIp(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<IpAccount | null, Error>({
    queryKey: queryKeys.ip(address ?? ""),
    queryFn: () => client!.ipCore.fetchIp(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
