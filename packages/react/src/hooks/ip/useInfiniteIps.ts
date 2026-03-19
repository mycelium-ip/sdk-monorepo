"use client";

import type {
  AccountWithPublicKey,
  IpAccount,
  IpFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of IP accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function IpList({ ownerEntity }: { ownerEntity: PublicKey }) {
 *   const {
 *     data,
 *     isLoading,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteIps({ currentOwnerEntity: ownerEntity });
 *
 *   const ips = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {ips.map((ip) => (
 *         <p key={ip.publicKey.toBase58()}>{ip.publicKey.toBase58()}</p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteIps(filter?: IpFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<IpAccount>>,
    Error
  >({
    queryKey: [...queryKeys.ips(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.ipCore.findIps(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
