"use client";

import type { DerivativeLinkAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single derivative link account by address.
 *
 * @example
 * ```tsx
 * function DerivativeDetails({ address }: { address: string }) {
 *   const { data, isLoading } = useDerivativeLink(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!data) return <p>Derivative link not found</p>;
 *
 *   return <p>Parent IP: {data.parentIp.toBase58()}</p>;
 * }
 * ```
 */
export function useDerivativeLink(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<DerivativeLinkAccount | null, Error>({
    queryKey: queryKeys.derivative(address ?? ""),
    queryFn: () => client!.ipCore.fetchDerivativeLink(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
