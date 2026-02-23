import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateEntityMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";
import { deriveSchemaPda } from "../../pda";
import { ENTITY_SCHEMA_ID, VERSION_1 } from "../../constants";

export async function createUpdateEntityMetadataTransaction(params: {
  program: Program<Metadata>;
  entityPda: PublicKey;
  previousMetadataPda: PublicKey;
  payer: PublicKey;
  metadataUri: string;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    entityPda,
    previousMetadataPda,
    payer,
    metadataUri,
    controllers,
  } = params;

  const schemaId = ENTITY_SCHEMA_ID;
  const schemaVersion = VERSION_1;

  const [schemaPda] = deriveSchemaPda(schemaId, schemaVersion);
  const previousMetadata =
    await program.account.entityMetadata.fetchNullable(previousMetadataPda);
  if (!previousMetadata) {
    throw new Error("No previous metadata");
  }
  const previousVersion = previousMetadata?.revision;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildUpdateEntityMetadataIx({
    program,
    entityPda,
    previousMetadataPda,
    schemaPda,
    payer,
    revision: previousVersion.addn(1),
    metadataUri,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
