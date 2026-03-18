"use client";

import type {
  EntityControlTransferred,
  TransferEntityControlParams,
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
 * Hook to transfer entity control to a new controller.
 *
 * @example
 * ```tsx
 * function TransferControlButton({ entityPubkey, newController }: Props) {
 *   const { mutate, isPending } = useTransferEntityControl();
 *
 *   const handleTransfer = () => {
 *     mutate({
 *       entity: entityPubkey,
 *       newController,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleTransfer} disabled={isPending}>
 *       Transfer Control
 *     </button>
 *   );
 * }
 * ```
 */
export function useTransferEntityControl() {
  const {
    client,
    connection,
    wallet,
    confirmation,
    cluster,
    executeTransaction: customExecutor,
  } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

  return {
    ...useMutation<
      TransactionResult<EntityControlTransferred>,
      Error,
      TransferEntityControlParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction =
          await client.ipCore.entity.transferControlIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.ipCore.parseEvent<EntityControlTransferred>(conn, sig),
          customExecutor,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
      },
    }),
    isWalletConnected,
  };
}
