"use client";

import type { RevokeLicenseGrantParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult, Error, RevokeLicenseGrantParams>({
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
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.grants() });
      },
    }),
    isWalletConnected,
  };
}
