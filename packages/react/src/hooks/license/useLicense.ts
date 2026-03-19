"use client";

import type { LicenseAccount } from "@mycelium-ip/core-sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to fetch a single license account by address.
 *
 * @example
 * ```tsx
 * function LicenseDetails({ address }: { address: string }) {
 *   const { data, isLoading } = useLicense(address);
 *
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!data) return <p>License not found</p>;
 *
 *   return <p>Derivatives allowed: {data.derivativesAllowed ? "Yes" : "No"}</p>;
 * }
 * ```
 */
export function useLicense(address: string | null | undefined) {
  const { client } = useMyceliumContext();

  return useQuery<LicenseAccount | null, Error>({
    queryKey: queryKeys.license(address ?? ""),
    queryFn: () => client!.license.fetchLicense(new PublicKey(address!)),
    enabled: !!client && !!address,
  });
}
