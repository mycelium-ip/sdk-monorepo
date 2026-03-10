"use client";

import type { CreateIpParams, IpCreated } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clusterToChain,
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create a new IP (Intellectual Property) asset.
 *
 * The treasury and payer token accounts are automatically derived from the
 * protocol config if not provided.
 *
 * @example
 * ```tsx
 * function CreateIpButton({ entityPubkey }: { entityPubkey: PublicKey }) {
 *   const { mutate, isPending } = useCreateIp();
 *
 *   const handleCreate = () => {
 *     // Use sha256Hash() from @mycelium-ip/core-sdk to hash your content
 *     mutate({
 *       registrantEntity: entityPubkey,
 *       contentHash: sha256Hash(new TextEncoder().encode("my-content")),
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
  const {
    client,
    connection,
    wallet,
    confirmation,
    cluster,
    executeTransaction: customExecutor,
  } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null;

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
          clusterToChain(cluster),
          (conn, sig) => client.ipCore.parseEvent<IpCreated>(conn, sig),
          customExecutor,
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
      },
    }),
    isWalletConnected,
  };
}
