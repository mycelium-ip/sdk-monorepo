"use client";

import type {
  DerivativeLicenseUpdated,
  UpdateDerivativeLicenseParams,
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
 * Hook to update the license on a derivative link.
 *
 * @example
 * ```tsx
 * function UpdateDerivativeLicenseButton({ parentIp, childIp, childOwner, newGrant, newLicense }: Props) {
 *   const { mutate, isPending } = useUpdateDerivativeLicense();
 *
 *   const handleUpdate = () => {
 *     mutate({
 *       parentIp,
 *       childIp,
 *       childOwnerEntity: childOwner,
 *       newLicenseGrant: newGrant,
 *       newLicense: newLicense,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleUpdate} disabled={isPending}>
 *       Update License
 *     </button>
 *   );
 * }
 * ```
 */
export function useUpdateDerivativeLicense() {
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
      TransactionResult<DerivativeLicenseUpdated>,
      Error,
      UpdateDerivativeLicenseParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction =
          await client.ipCore.derivative.updateLicenseIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.ipCore.parseEvent<DerivativeLicenseUpdated>(conn, sig),
          customExecutor,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.derivatives() });
      },
    }),
    isWalletConnected,
  };
}
