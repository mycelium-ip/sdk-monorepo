"use client";

import type { CreateLicenseGrantParams } from "@mycelium-ip/core-sdk";
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

  return useMutation<TransactionResult, Error, CreateLicenseGrantParams>({
    mutationFn: async (params) => {
      const instruction = await client.license.grant.createIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grants() });
    },
  });
}
