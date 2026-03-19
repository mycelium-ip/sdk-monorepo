"use client";

import type {
  AccountWithPublicKey,
  MetadataAccount,
  MetadataFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of metadata accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function MetadataList({ parent }: { parent: PublicKey }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteMetadata({ parent, parentType: "entity" });
 *
 *   const items = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {items.map((m) => (
 *         <p key={m.publicKey.toBase58()}>
 *           Revision: {m.account.revision.toString()}
 *         </p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteMetadata(filter?: MetadataFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<MetadataAccount>>,
    Error
  >({
    queryKey: [...queryKeys.metadata(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.ipCore.findMetadata(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
