"use client";

import type { IpTransferred, TransferIpParams } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clusterToChain,
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
  const { client, connection, wallet, confirmation, cluster } =
    useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

  return {
    ...useMutation<TransactionResult<IpTransferred>, Error, TransferIpParams>({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.ipCore.ip.transferIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          clusterToChain(cluster),
          (conn, sig) => client.ipCore.parseEvent<IpTransferred>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
      },
    }),
    isWalletConnected,
  };
}
