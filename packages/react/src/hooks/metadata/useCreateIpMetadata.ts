"use client";

import type {
  CreateIpMetadataParams,
  IpMetadataCreated,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeTransaction,
  type TransactionResult,
} from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Hook to create metadata for an IP.
 *
 * @example
 * ```tsx
 * function AddIpMetadata({ ipPubkey, ownerEntity, schemaPubkey }: Props) {
 *   const { mutate, isPending } = useCreateIpMetadata();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       ip: ipPubkey,
 *       ownerEntity: ownerEntity,
 *       schema: schemaPubkey,
 *       revision: 1n,
 *       data: new TextEncoder().encode(JSON.stringify(metadata)),
 *       cid: "Qm...",
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       Add IP Metadata
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateIpMetadata() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<
      TransactionResult<IpMetadataCreated>,
      Error,
      CreateIpMetadataParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }
        const instruction =
          await client.ipCore.metadata.createIpMetadataIx(params);
        return executeTransaction(
          connection,
          wallet,
          instruction,
          confirmation,
          (conn, sig) => client.ipCore.parseEvent<IpMetadataCreated>(conn, sig),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
        queryClient.invalidateQueries({ queryKey: queryKeys.metadata() });
      },
    }),
    isWalletConnected,
  };
}
