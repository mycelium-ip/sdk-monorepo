"use client";

import type { UpdateEntityControllersParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to update entity controllers.
 *
 * @example
 * ```tsx
 * function UpdateControllersButton({ entityPubkey }: { entityPubkey: PublicKey }) {
 *   const { mutate, isPending } = useUpdateEntityControllers();
 *
 *   const handleUpdate = () => {
 *     mutate({
 *       entity: entityPubkey,
 *       newControllers: [controller1, controller2],
 *       newThreshold: 2,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleUpdate} disabled={isPending}>
 *       Update Controllers
 *     </button>
 *   );
 * }
 * ```
 */
export function useUpdateEntityControllers() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();

  return useMutation<TransactionResult, Error, UpdateEntityControllersParams>({
    mutationFn: async (params) => {
      const instruction =
        await client.ipCore.entity.updateControllersIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
    },
  });
}
