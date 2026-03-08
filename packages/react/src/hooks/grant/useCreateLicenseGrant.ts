"use client";

import type {
  CreateLicenseGrantParams,
  LicenseGrantCreated,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a license grant for an entity.
 *
 * @example
 * ```tsx
 * function CreateGrantButton({ originIp, authorityEntity, granteeEntity }: Props) {
 *   const { mutate, isPending } = useCreateLicenseGrant();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       originIp,
 *       authorityEntity,
 *       granteeEntity,
 *       expiration: BigInt(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Create Grant
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateLicenseGrant() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<
      TransactionResult<LicenseGrantCreated>,
      Error,
      CreateLicenseGrantParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.license.grant.createIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          (conn, sig) =>
            client.license.parseEvent<LicenseGrantCreated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.grants() });
      },
    }),
    isWalletConnected,
  };
}
