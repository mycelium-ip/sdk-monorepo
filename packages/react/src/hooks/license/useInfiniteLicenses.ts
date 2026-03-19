"use client";

import type {
  AccountWithPublicKey,
  LicenseAccount,
  LicenseFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of license accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function LicenseList({ originIp }: { originIp: PublicKey }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteLicenses({ originIp });
 *
 *   const licenses = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {licenses.map((l) => (
 *         <p key={l.publicKey.toBase58()}>
 *           Authority: {l.account.authority.toBase58()}
 *         </p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteLicenses(filter?: LicenseFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<LicenseAccount>>,
    Error
  >({
    queryKey: [...queryKeys.licenses(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.license.findLicenses(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
