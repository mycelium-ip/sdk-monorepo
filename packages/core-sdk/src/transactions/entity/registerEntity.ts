import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  buildCreateEntityMetadataIx,
  buildRegisterEntityInstruction,
} from "../../instructions";
import type { Entity } from "../../types/entity";
import { Metadata } from "../../types";
import {
  deriveEntityCounterPda,
  deriveEntityPda,
  deriveSchemaPda,
} from "../../pda";
import { ENTITY_SCHEMA_ID, VERSION_1 } from "../../constants";

export type CreateEntityTransactionParams = {
  program: Program<Entity>;
  metadataProgram: Program<Metadata>;
  controllers: anchor.web3.PublicKey[];
  threshold: number;
  metadataCid: string;
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
  metadataCid,
  payer,
}: CreateEntityTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  let entityIndex = new anchor.BN(0);

  const [entityCounterPda] = deriveEntityCounterPda();

  const currentCounter =
    await program.account.entityCounter.fetchNullable(entityCounterPda);

  if (currentCounter) {
    entityIndex = currentCounter.nextEntityIndex;
  }

  // Build the instruction using our reusable helper
  const instruction = await buildRegisterEntityInstruction({
    program,
    controllers,
    threshold,
    payer,
  });

  const [entityPda] = deriveEntityPda(payer, entityIndex);
  const schemaId = ENTITY_SCHEMA_ID;
  const schemaVersion = VERSION_1;

  const [schemaPda] = deriveSchemaPda(schemaId, schemaVersion);

  const currentSchema =
    await metadataProgram.account.schemaRegistry.fetchNullable(schemaPda);

  if (!currentSchema) {
    throw new Error(
      `Schema not registered: version=${schemaVersion.toString()}`,
    );
  }

  const metadataInstruction = await buildCreateEntityMetadataIx({
    program: metadataProgram,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    metadataCid,
    payer,
    controllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction();

  transaction.add(instruction);

  transaction.add(metadataInstruction);
  return { transaction };
}
