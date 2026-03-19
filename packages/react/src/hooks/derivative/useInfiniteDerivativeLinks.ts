"use client";

import type {
  AccountWithPublicKey,
  DerivativeLinkAccount,
  DerivativeLinkFilter,
  PaginatedResult,
} from "@mycelium-ip/core-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

const PAGE_SIZE = 20;

/**
 * Hook to fetch a paginated list of derivative link accounts with optional filtering.
 *
 * @example
 * ```tsx
 * function DerivativeList({ parentIp }: { parentIp: PublicKey }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *   } = useInfiniteDerivativeLinks({ parentIp });
 *
 *   const links = data?.pages.flatMap((p) => p.items) ?? [];
 *
 *   return (
 *     <div>
 *       {links.map((link) => (
 *         <p key={link.publicKey.toBase58()}>
 *           Child: {link.account.childIp.toBase58()}
 *         </p>
 *       ))}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteDerivativeLinks(filter?: DerivativeLinkFilter) {
  const { client } = useMyceliumContext();

  return useInfiniteQuery<
    PaginatedResult<AccountWithPublicKey<DerivativeLinkAccount>>,
    Error
  >({
    queryKey: [...queryKeys.derivatives(), { filter }],
    queryFn: ({ pageParam }) =>
      client!.ipCore.findDerivativeLinks(filter, {
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + PAGE_SIZE : undefined,
    enabled: !!client,
  });
}
