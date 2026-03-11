"use client";

import type {
  CreateIpMetadataParams,
  CreateIpParams,
  IpCreated,
  IpMetadataCreated,
} from "@mycelium-ip/core-sdk";
import { toFixedBytes, buildSignerMetas } from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SystemProgram } from "@solana/web3.js";
import {
  clusterToChain,
  executeTransactionWithInstructions,
} from "../../utils/transaction";
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
 *         contentHash: sha256Hash(new TextEncoder().encode("my-content")),
 *         treasuryTokenAccount: treasuryAccount,
 *         payerTokenAccount: payerAccount,
 *       },
 *       metadata: {
 *         schema: schemaPubkey,
 *         dataHash: sha256Hash(
 *           new TextEncoder().encode(
 *             JSON.stringify({ title: "My Artwork", artist: "Anonymous" }),
 *           ),
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
          params.ip.contentHash,
        );

        // Derive the metadata PDA with revision 1 (IP is being created in
        // the same tx and doesn't exist on-chain yet).
        const metadata = client.ipCore.deriveIpMetadataAddress(ipPda, 1);

        const payer = params.metadata.payer ?? wallet.publicKey;
        if (!payer) {
          throw new Error("Wallet not connected");
        }

        // Build both instructions in parallel using the Anchor program directly.
        const [ipIx, metadataIx] = await Promise.all([
          client.ipCore.ip.createIx(params.ip),
          client.ipCore.program.methods
            .createIpMetadata(
              toFixedBytes(params.metadata.dataHash, 32, "dataHash"),
              toFixedBytes(params.metadata.cid, 96, "cid"),
            )
            .accounts({
              metadata,
              ip: ipPda,
              ownerEntity: params.ip.registrantEntity,
              schema: params.metadata.schema,
              payer,
              systemProgram: SystemProgram.programId,
            })
            .remainingAccounts(
              buildSignerMetas(params.metadata.controllerSigners),
            )
            .instruction(),
        ]);

        const { signature } = await executeTransactionWithInstructions(
          connection,
          wallet,
          [ipIx, metadataIx],
          confirmation,
          clusterToChain(cluster),
          customExecutor,
        );

        // Parse events and filter by name (more robust than array indexing).
        const events = await client.ipCore.parseEvents(connection, signature);
        return {
          signature,
          ipCreated: client.ipCore.findEventByName<IpCreated>(
            events,
            "ipCreated",
          ),
          ipMetadataCreated: client.ipCore.findEventByName<IpMetadataCreated>(
            events,
            "ipMetadataCreated",
          ),
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
