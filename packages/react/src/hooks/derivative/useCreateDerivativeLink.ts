"use client";

import type {
  CreateDerivativeLinkParams,
  DerivativeLinkCreated,
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
 * Hook to create a derivative link between IPs.
 *
 * @example
 * ```tsx
 * function CreateDerivativeButton({ parentIp, childIp, childOwner, grant, license }: Props) {
 *   const { mutate, isPending } = useCreateDerivativeLink();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       parentIp,
 *       childIp,
 *       childOwnerEntity: childOwner,
 *       licenseGrant: grant,
 *       license,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Create Derivative Link
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateDerivativeLink() {
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
      TransactionResult<DerivativeLinkCreated>,
      Error,
      CreateDerivativeLinkParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.ipCore.derivative.createIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.ipCore.parseEvent<DerivativeLinkCreated>(conn, sig),
          customExecutor,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.derivatives() });
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
      },
    }),
    isWalletConnected,
  };
}
