import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  buildCreateEntityMetadataIx,
  buildRegisterEntityInstruction,
} from "../../instructions";
import type { Entity } from "../../types/entity";
import { Blockhash } from "@solana/web3.js";
import { Metadata } from "../../types";
import { deriveEntityPda, deriveSchemaPda } from "../../pda";

export type CreateEntityTransactionParams = {
  program: Program<Entity>;
  metadataProgram: Program<Metadata>;
  entityId: Uint8Array;
  controllers: anchor.web3.PublicKey[];
  threshold: number;
  name: string;
  handle: string;
  bio: string;
  pictureUrl: string;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing a RegisterEntity instruction
 * Does NOT sign or send the transaction
 */
export async function createEntityTransaction({
  program,
  metadataProgram,
  entityId,
  controllers,
  threshold,
  name,
  handle,
  bio,
  pictureUrl,
  payer,
}: CreateEntityTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  // Build the instruction using our reusable helper
  const { instruction } = buildRegisterEntityInstruction({
    program,
    entityId,
    controllers,
    threshold,
    payer,
  });

  const [entityPda] = deriveEntityPda(entityId);

  const [schemaPda] = deriveSchemaPda("1", 1);

  const metadataInstruction = buildCreateEntityMetadataIx({
    program: metadataProgram,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: anchor.BN(1),
    name,
    handle,
    bio,
    pictureUrl,
    payer,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction()
    .add(await instruction)
    .add(await metadataInstruction);

  return { transaction };
}
