"use client";

import type { UpdateLicenseParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();

  return useMutation<TransactionResult, Error, UpdateLicenseParams>({
    mutationFn: async (params) => {
      const instruction = await client.license.license.updateIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
    },
  });
}
