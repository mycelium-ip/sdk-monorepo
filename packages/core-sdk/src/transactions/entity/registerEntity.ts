import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  buildCreateEntityMetadataIx,
  buildRegisterEntityInstruction,
  buildRegisterSchemaIx,
} from "../../instructions";
import type { Entity } from "../../types/entity";
import { Metadata } from "../../types";
import { deriveEntityPda, deriveSchemaPda } from "../../pda";
import { PublicKey } from "@solana/web3.js";

export type CreateEntityTransactionParams = {
  program: Program<Entity>;
  metadataProgram: Program<Metadata>;
  entityId: string;
  controllers: string[];
  threshold: number;
  metadataUri: string;
  payer: string;
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
  metadataUri,
  payer,
}: CreateEntityTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  const entityPublicKey = new PublicKey(entityId);
  const entityIdUint = entityPublicKey.toBytes();
  const payerPublicKey = new PublicKey(payer);
  const controllersPublicKey = controllers.map((c) => new PublicKey(c));

  // Build the instruction using our reusable helper
  const instruction = await buildRegisterEntityInstruction({
    program,
    entityId: entityPublicKey?.toBytes(),
    controllers: controllersPublicKey,
    threshold,
    payer: payerPublicKey,
  });

  const [entityPda] = deriveEntityPda(entityIdUint);

  const schemaCategory = "1";
  const schemaVersion = new anchor.BN(1);
  const schemaUri = "https://example.com";

  const [schemaPda] = deriveSchemaPda(schemaCategory, schemaVersion);

  const currentSchema =
    await metadataProgram.account.schemaRegistry.fetchNullable(schemaPda);

  const schemaInstruction = await buildRegisterSchemaIx({
    program: metadataProgram,
    category: schemaCategory,
    version: schemaVersion,
    creator: payerPublicKey,
    schemaUri: schemaUri,
  });

  const metadataInstruction = await buildCreateEntityMetadataIx({
    program: metadataProgram,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    metadataUri,
    payer: payerPublicKey,
    controllers: controllersPublicKey,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction({
    feePayer: payerPublicKey,
  }).add(instruction);

  if (!currentSchema) {
    transaction.add(schemaInstruction);
  }

  transaction.add(metadataInstruction);
  return { transaction };
}
