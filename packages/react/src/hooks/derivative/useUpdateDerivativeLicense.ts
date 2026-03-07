"use client";

import type { UpdateDerivativeLicenseParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();

  return useMutation<TransactionResult, Error, UpdateDerivativeLicenseParams>({
    mutationFn: async (params) => {
      const instruction =
        await client.ipCore.derivative.updateLicenseIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.derivatives() });
    },
  });
}
