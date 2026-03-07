"use client";

import type { CreateDerivativeLinkParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult, Error, CreateDerivativeLinkParams>({
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
