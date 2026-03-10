"use client";

import type {
  EntityControllersUpdated,
  UpdateEntityControllersParams,
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
  const { client, connection, wallet, confirmation, cluster } =
    useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

  return {
    ...useMutation<
      TransactionResult<EntityControllersUpdated>,
      Error,
      UpdateEntityControllersParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction =
          await client.ipCore.entity.updateControllersIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.ipCore.parseEvent<EntityControllersUpdated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
      },
    }),
    isWalletConnected,
  };
}
