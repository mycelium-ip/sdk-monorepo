"use client";

import type { TransferIpParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to transfer IP ownership to another entity.
 *
 * @example
 * ```tsx
 * function TransferIpButton({ ipPubkey, currentOwner, newOwner }: Props) {
 *   const { mutate, isPending } = useTransferIp();
 *
 *   const handleTransfer = () => {
 *     mutate({
 *       ip: ipPubkey,
 *       currentOwnerEntity: currentOwner,
 *       newOwnerEntity: newOwner,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleTransfer} disabled={isPending}>
 *       Transfer IP
 *     </button>
 *   );
 * }
 * ```
 */
export function useTransferIp() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();

  return useMutation<TransactionResult, Error, TransferIpParams>({
    mutationFn: async (params) => {
      const instruction = await client.ipCore.ip.transferIx(params);
      return executeTransaction(connection, wallet, instruction, confirmation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
    },
  });
}
