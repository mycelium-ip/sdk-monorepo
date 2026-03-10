"use client";

import type {
  CreateEntityMetadataParams,
  EntityMetadataCreated,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clusterToChain,
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create metadata for an entity.
 *
 * @example
 * ```tsx
 * function AddEntityMetadata({ entityPubkey, schemaPubkey }: Props) {
 *   const { mutate, isPending } = useCreateEntityMetadata();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       entity: entityPubkey,
 *       schema: schemaPubkey,
 *       data: new TextEncoder().encode(JSON.stringify(metadata)),
 *       cid: "Qm...",
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Add Metadata
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateEntityMetadata() {
  const { client, connection, wallet, confirmation, cluster } =
    useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

  return {
    ...useMutation<
      TransactionResult<EntityMetadataCreated>,
      Error,
      CreateEntityMetadataParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction =
          await client.ipCore.metadata.createEntityMetadataIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.ipCore.parseEvent<EntityMetadataCreated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
        queryClient.invalidateQueries({ queryKey: queryKeys.metadata() });
      },
    }),
    isWalletConnected,
  };
}
