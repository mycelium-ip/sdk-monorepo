"use client";

import type {
  AccountWithPublicKey,
  EntityAccount,
  EntityFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of entity accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function EntityList({ creator }: { creator: PublicKey }) {
 *   const {
 *     data,
 *     isLoading,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteEntities({ creator });
 *
 *   const entities = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {entities.map((e) => (
 *         <p key={e.publicKey.toBase58()}>{e.publicKey.toBase58()}</p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteEntities(filter?: EntityFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<EntityAccount>>,
    Error
  >({
    queryKey: [...queryKeys.entities(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.ipCore.findEntities(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
