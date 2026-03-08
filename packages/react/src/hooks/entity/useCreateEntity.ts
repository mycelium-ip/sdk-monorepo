"use client";

import type { CreateEntityParams, EntityCreated } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a new entity.
 *
 * @example
 * ```tsx
 * function CreateEntityButton() {
 *   const { mutate, isPending, error } = useCreateEntity();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       handle: "my-entity",
 *       additionalControllers: [],
 *       signatureThreshold: 1,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       {isPending ? "Creating..." : "Create Entity"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateEntity() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult<EntityCreated>, Error, CreateEntityParams>(
      {
        mutationFn: async (params) => {
          if (!client || !wallet) {
            throw new Error("Wallet not connected");
          }
          const instruction = await client.ipCore.entity.createIx(params);
          return executeTransaction(
            connection,
            wallet,
            instruction,
            confirmation,
            (conn, sig) => client.ipCore.parseEvent<EntityCreated>(conn, sig),
          );
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
        },
      },
    ),
    isWalletConnected,
  };
}
