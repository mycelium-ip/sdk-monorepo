"use client";

import type { RevokeLicenseParams } from "@mycelium-ip/core-sdk";
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

  return useMutation<TransactionResult, Error, RevokeLicenseParams>({
    mutationFn: async (params) => {
      const instruction = await client.license.license.revokeIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
    },
  });
}
