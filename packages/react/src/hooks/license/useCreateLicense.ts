"use client";

import type { CreateLicenseParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a new license for an IP.
 *
 * @example
 * ```tsx
 * function CreateLicenseButton({ originIp, ownerEntity }: Props) {
 *   const { mutate, isPending } = useCreateLicense();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       originIp,
 *       ownerEntity,
 *       derivativesAllowed: true,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Create License
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateLicense() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult, Error, CreateLicenseParams>({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.license.license.createIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
      },
    }),
    isWalletConnected,
  };
}
