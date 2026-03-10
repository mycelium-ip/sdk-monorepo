"use client";

import type {
  LicenseUpdated,
  UpdateLicenseParams,
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
 * Hook to update an existing license.
 *
 * @example
 * ```tsx
 * function UpdateLicenseButton({ originIp, authorityEntity }: Props) {
 *   const { mutate, isPending } = useUpdateLicense();
 *
 *   const handleUpdate = () => {
 *     mutate({
 *       originIp,
 *       authorityEntity,
 *       derivativesAllowed: false,
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
export function useUpdateLicense() {
  const { client, connection, wallet, confirmation, cluster } =
    useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

  return {
    ...useMutation<
      TransactionResult<LicenseUpdated>,
      Error,
      UpdateLicenseParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.license.license.updateIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) => client.license.parseEvent<LicenseUpdated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
      },
    }),
    isWalletConnected,
  };
}
