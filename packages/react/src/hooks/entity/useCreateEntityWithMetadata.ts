"use client";

import type {
  CreateEntityMetadataParams,
  CreateEntityParams,
  EntityCreated,
  EntityMetadataCreated,
} from "@mycelium-ip/core-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeTransactionWithInstructions } from "../../utils/transaction";
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
 *         data: new TextEncoder().encode(JSON.stringify({ name: "My Org" })),
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
  const { client, connection, wallet, confirmation } = useMyceliumContext();
  const queryClient = useQueryClient();
  const isWalletConnected = wallet !== null && wallet.publicKey !== null;

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

        // Build both instructions in parallel.
        const [entityIx, metadataIx] = await Promise.all([
          client.ipCore.entity.createIx(params.entity),
          client.ipCore.metadata.createEntityMetadataIx({
            ...params.metadata,
            entity: entityPda,
          }),
        ]);

        const { signature } = await executeTransactionWithInstructions(
          connection,
          wallet,
          [entityIx, metadataIx],
          confirmation,
        );

        // Parse both events emitted by the combined transaction.
        const events = await client.ipCore.parseEvents(connection, signature);
        return {
          signature,
          entityCreated: events[0] as EntityCreated | undefined,
          entityMetadataCreated: events[1] as EntityMetadataCreated | undefined,
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
