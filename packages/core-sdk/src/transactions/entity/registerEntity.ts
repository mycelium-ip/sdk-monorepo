import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  buildCreateEntityMetadataIx,
  buildRegisterEntityInstruction,
  buildRegisterSchemaIx,
} from "../../instructions";
import type { Entity } from "../../types/entity";
import { Metadata } from "../../types";
import {
  deriveEntityCounterPda,
  deriveEntityPda,
  deriveSchemaPda,
} from "../../pda";
import { buildInitEntityCounterInstruction } from "../../instructions/entity/initEntityCounter";

export type CreateEntityTransactionParams = {
  program: Program<Entity>;
  metadataProgram: Program<Metadata>;
  controllers: anchor.web3.PublicKey[];
  threshold: number;
  metadataUri: string;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing a RegisterEntity instruction
 * Does NOT sign or send the transaction
 */
export async function createEntityTransaction({
  program,
  metadataProgram,
  controllers,
  threshold,
  metadataUri,
  payer,
}: CreateEntityTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  let entityIndex = new anchor.BN(0);

  const [entityCounterPda] = deriveEntityCounterPda(payer);

  const currentCounter =
    await program.account.entityCounter.fetchNullable(entityCounterPda);

  const counterInstruction = await buildInitEntityCounterInstruction({
    program,
    payer,
  });

  if (currentCounter) {
    entityIndex = currentCounter.nextEntityIndex;
  }

  // Build the instruction using our reusable helper
  const instruction = await buildRegisterEntityInstruction({
    program,
    entityCounterPda,
    controllers,
    threshold,
    payer,
  });

  const [entityPda] = deriveEntityPda(payer, entityIndex);

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
    creator: payer,
    schemaUri: schemaUri,
  });

  const metadataInstruction = await buildCreateEntityMetadataIx({
    program: metadataProgram,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    metadataUri,
    payer,
    controllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction();

  if (!currentCounter) {
    transaction.add(counterInstruction);
  }

  transaction.add(instruction);

  if (!currentSchema) {
    transaction.add(schemaInstruction);
  }

  transaction.add(metadataInstruction);
  return { transaction };
}
