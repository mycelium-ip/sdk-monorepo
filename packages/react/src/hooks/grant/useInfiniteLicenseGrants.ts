"use client";

import type {
  AccountWithPublicKey,
  LicenseGrantAccount,
  LicenseGrantFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of license grant accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function GrantList({ grantee }: { grantee: PublicKey }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteLicenseGrants({ grantee });
 *
 *   const grants = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {grants.map((g) => (
 *         <p key={g.publicKey.toBase58()}>
 *           Expires: {g.account.expiration.toString()}
 *         </p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteLicenseGrants(filter?: LicenseGrantFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<LicenseGrantAccount>>,
    Error
  >({
    queryKey: [...queryKeys.grants(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.license.findLicenseGrants(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
