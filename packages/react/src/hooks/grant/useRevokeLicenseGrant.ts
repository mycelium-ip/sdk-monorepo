"use client";

import type {
  LicenseGrantRevoked,
  RevokeLicenseGrantParams,
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
 * Hook to revoke a license grant.
 *
 * @example
 * ```tsx
 * function RevokeGrantButton({ originIp, authorityEntity, granteeEntity }: Props) {
 *   const { mutate, isPending } = useRevokeLicenseGrant();
 *
 *   const handleRevoke = () => {
 *     mutate({
 *       originIp,
 *       authorityEntity,
 *       granteeEntity,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleRevoke} disabled={isPending}>
 *       Revoke Grant
 *     </button>
 *   );
 * }
 * ```
 */
export function useRevokeLicenseGrant() {
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
      TransactionResult<LicenseGrantRevoked>,
      Error,
      RevokeLicenseGrantParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.license.grant.revokeIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) =>
            client.license.parseEvent<LicenseGrantRevoked>(conn, sig),
          customExecutor,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.grants() });
      },
    }),
    isWalletConnected,
  };
}
