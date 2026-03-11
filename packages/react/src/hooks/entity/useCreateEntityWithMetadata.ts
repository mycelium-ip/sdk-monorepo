"use client";

import type {
  CreateEntityMetadataParams,
  CreateEntityParams,
  EntityCreated,
  EntityMetadataCreated,
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
 * Parameters for creating an entity and its metadata in a single transaction.
 */
export interface CreateEntityWithMetadataParams {
  /** Parameters for the entity creation instruction. */
  entity: CreateEntityParams;
  /** Parameters for the metadata instruction. The `entity` field is derived automatically. */
  metadata: Omit<CreateEntityMetadataParams, "entity">;
}

/**
 * Result of creating an entity and its metadata in a single transaction.
 */
export interface CreateEntityWithMetadataResult {
  /** Transaction signature */
  signature: string;
  /** Decoded EntityCreated event (may be undefined if RPC indexing is delayed) */
  entityCreated?: EntityCreated;
  /** Decoded EntityMetadataCreated event (may be undefined if RPC indexing is delayed) */
  entityMetadataCreated?: EntityMetadataCreated;
}

/**
 * Hook to atomically create a new entity and attach metadata in a single
 * on-chain transaction.
 *
 * The entity PDA is derived internally from the caller's wallet public key and
 * the supplied `handle`, so you do not need to compute it yourself before
 * calling `mutate`.
 *
 * @example
 * ```tsx
 * function CreateEntityWithMetadata({ schemaPubkey }: { schemaPubkey: PublicKey }) {
 *   const { mutate, isPending } = useCreateEntityWithMetadata();
 *
 *   const handleCreate = () => {
 *     mutate({
 *       entity: {
 *         handle: "my-organization",
 *         additionalControllers: [],
 *         signatureThreshold: 1,
 *       },
 *       metadata: {
 *         schema: schemaPubkey,
 *         revision: 1n,
 *         dataHash: sha256Hash(new TextEncoder().encode(JSON.stringify({ name: "My Org" }))),
 *         cid: "ipfs://QmMetadata...",
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isPending}>
 *       {isPending ? "Creating..." : "Create Entity with Metadata"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateEntityWithMetadata() {
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
      CreateEntityWithMetadataResult,
      Error,
      CreateEntityWithMetadataParams
    >({
      mutationFn: async (params) => {
        if (!client || !wallet) {
          throw new Error("Wallet not connected");
        }

        // Derive the entity PDA so we can reference it in the metadata IX.
        const creator = params.entity.creator ?? wallet.publicKey;
        if (!creator) {
          throw new Error("Wallet not connected");
        }

        const entityPda = client.ipCore.deriveEntityAddress(
          creator,
          params.entity.handle,
        );

        // Derive the metadata PDA with revision 1 (entity is being created in
        // the same tx and doesn't exist on-chain yet).
        const metadata = client.ipCore.deriveEntityMetadataAddress(
          entityPda,
          1,
        );

        const payer = params.metadata.payer ?? wallet.publicKey;
        if (!payer) {
          throw new Error("Wallet not connected");
        }

        // Build both instructions in parallel using the Anchor program directly.
        const [entityIx, metadataIx] = await Promise.all([
          client.ipCore.entity.createIx(params.entity),
          client.ipCore.program.methods
            .createEntityMetadata(
              toFixedBytes(params.metadata.dataHash, 32, "dataHash"),
              toFixedBytes(params.metadata.cid, 96, "cid"),
            )
            .accounts({
              metadata,
              entity: entityPda,
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
          [entityIx, metadataIx],
          confirmation,
          clusterToChain(cluster),
          customExecutor,
        );

        // Parse events and filter by name (more robust than array indexing).
        const events = await client.ipCore.parseEvents(connection, signature);
        return {
          signature,
          entityCreated: client.ipCore.findEventByName<EntityCreated>(
            events,
            "entityCreated",
          ),
          entityMetadataCreated:
            client.ipCore.findEventByName<EntityMetadataCreated>(
              events,
              "entityMetadataCreated",
            ),
        };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
        queryClient.invalidateQueries({ queryKey: queryKeys.metadata() });
      },
    }),
    isWalletConnected,
  };
}
