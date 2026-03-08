"use client";

import type {
  LicenseRevoked,
  RevokeLicenseParams,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to revoke a license.
 *
 * @example
 * ```tsx
 * function RevokeLicenseButton({ originIp, authorityEntity }: Props) {
 *   const { mutate, isPending } = useRevokeLicense();
 *
 *   const handleRevoke = () => {
 *     mutate({
 *       originIp,
 *       authorityEntity,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleRevoke} disabled={isPending}>
 *       Revoke License
 *     </button>
 *   );
 * }
 * ```
 */
export function useRevokeLicense() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<
      TransactionResult<LicenseRevoked>,
      Error,
      RevokeLicenseParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.license.license.revokeIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          (conn, sig) => client.license.parseEvent<LicenseRevoked>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
      },
    }),
    isWalletConnected,
  };
}
