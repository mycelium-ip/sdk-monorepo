"use client";

import type { LicenseGrantAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single license grant account by address.
 *
 * @example
 * ```tsx
 * function GrantDetails({ address }: { address: string }) {
 *   const { data, isLoading } = useLicenseGrant(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!data) return <p>Grant not found</p>;
 *
 *   return <p>Grantee: {data.grantee.toBase58()}</p>;
 * }
 * ```
 */
export function useLicenseGrant(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<LicenseGrantAccount | null, Error>({
    queryKey: queryKeys.grant(address ?? ""),
    queryFn: () => client!.license.fetchLicenseGrant(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
