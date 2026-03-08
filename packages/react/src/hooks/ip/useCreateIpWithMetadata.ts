"use client";

import type {
  CreateIpMetadataParams,
  CreateIpParams,
  IpCreated,
  IpMetadataCreated,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeTransactionWithInstructions } from "../../utils/transaction";
import { useMyceliumContext } from "../internal/useMyceliumContext";
import { queryKeys } from "../queries/queryKeys";

/**
 * Parameters for creating an IP and its metadata in a single transaction.
 */
export interface CreateIpWithMetadataParams {
  /** Parameters for the IP creation instruction. */
  ip: CreateIpParams;
  /**
   * Parameters for the metadata instruction. The `ip` and `ownerEntity` fields
   * are derived automatically from the `ip` params.
   */
  metadata: Omit<CreateIpMetadataParams, "ip" | "ownerEntity">;
}

/**
 * Result of creating an IP and its metadata in a single transaction.
 */
export interface CreateIpWithMetadataResult {
  /** Transaction signature */
  signature: string;
  /** Decoded IpCreated event (may be undefined if RPC indexing is delayed) */
  ipCreated?: IpCreated;
  /** Decoded IpMetadataCreated event (may be undefined if RPC indexing is delayed) */
  ipMetadataCreated?: IpMetadataCreated;
}

/**
 * Hook to atomically create a new IP asset and attach metadata in a single
 * on-chain transaction.
 *
 * The IP PDA is derived internally from `registrantEntity` and the content
 * hash, so you do not need to compute it yourself before calling `mutate`.
 * The `ownerEntity` for the metadata instruction is also inferred from the IP
 * params' `registrantEntity`.
 *
 * @example
 * ```tsx
 * function CreateIpWithMetadata({
 *   entityPubkey,
 *   schemaPubkey,
 *   treasuryAccount,
 *   payerAccount,
 * }: Props) {
 *   const { mutate, isPending } = useCreateIpWithMetadata();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       ip: {
 *         registrantEntity: entityPubkey,
 *         content: new TextEncoder().encode("ipfs://QmXxx..."),
 *         treasuryTokenAccount: treasuryAccount,
 *         payerTokenAccount: payerAccount,
 *       },
 *       metadata: {
 *         schema: schemaPubkey,
 *         revision: 1n,
 *         data: new TextEncoder().encode(
 *           JSON.stringify({ title: "My Artwork", artist: "Anonymous" }),
 *         ),
 *         cid: "ipfs://QmIpMetadata...",
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       {isPending ? "Registering..." : "Register IP with Metadata"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateIpWithMetadata() {
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

  return {
    ...useMutation<
      CreateIpWithMetadataResult,
      Error,
      CreateIpWithMetadataParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }

        // Derive the IP PDA so we can reference it in the metadata IX.
        const ipPda = client.ipCore.deriveIpAddress(
          params.ip.registrantEntity,
          params.ip.content,
        );

        // Build both instructions in parallel.
        const [ipIx, metadataIx] = await Promise.all([
          client.ipCore.ip.createIx(params.ip),
          client.ipCore.metadata.createIpMetadataIx({
            ...params.metadata,
            ip: ipPda,
            ownerEntity: params.ip.registrantEntity,
          }),
        ]);

        const { signature } = await executeTransactionWithInstructions(
          connection,
          wallet,
          [ipIx, metadataIx],
          confirmation,
        );

        // Parse both events emitted by the combined transaction.
        const events = await client.ipCore.parseEvents(connection, signature);
        return {
          signature,
          ipCreated: events[0] as IpCreated | undefined,
          ipMetadataCreated: events[1] as IpMetadataCreated | undefined,
        };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
        queryClient.invalidateQueries({ queryKey: queryKeys.metadata() });
      },
    }),
    isWalletConnected,
  };
}
