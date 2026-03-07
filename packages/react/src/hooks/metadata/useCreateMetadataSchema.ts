"use client";

import type { CreateMetadataSchemaParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a new metadata schema.
 *
 * @example
 * ```tsx
 * function CreateSchemaButton() {
 *   const { mutate, isPending } = useCreateMetadataSchema();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       id: "my-schema",
 *       version: "1.0.0",
 *       data: new TextEncoder().encode(JSON.stringify(schemaDefinition)),
 *       cid: "Qm...",
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Create Schema
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateMetadataSchema() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult, Error, CreateMetadataSchemaParams>({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.ipCore.metadata.createSchemaIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.metadata() });
      },
    }),
    isWalletConnected,
  };
}
