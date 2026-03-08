"use client";

import type { CreateIpParams, IpCreated } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a new IP (Intellectual Property) asset.
 *
 * @example
 * ```tsx
 * function CreateIpButton({ entityPubkey }: { entityPubkey: PublicKey }) {
 *   const { mutate, isPending } = useCreateIp();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       registrantEntity: entityPubkey,
 *       content: new TextEncoder().encode("ip-content-hash"),
 *       treasuryTokenAccount: treasuryAccount,
 *       payerTokenAccount: payerAccount,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Create IP
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateIp() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<TransactionResult<IpCreated>, Error, CreateIpParams>({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction = await client.ipCore.ip.createIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          (conn, sig) => client.ipCore.parseEvent<IpCreated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
      },
    }),
    isWalletConnected,
  };
}
