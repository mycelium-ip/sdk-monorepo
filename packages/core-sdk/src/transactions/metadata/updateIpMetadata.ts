import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";
import { deriveSchemaPda } from "../../pda";

export async function createUpdateIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  entityPda: PublicKey;
  previousMetadataPda: PublicKey;
  payer: PublicKey;
  metadataUri: string;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    payer,
    metadataUri,
    controllers,
  } = params;

  const schemaId = "metadata.registry";
  const schemaVersion = "1.0.0";

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
  const instruction = await buildUpdateIpMetadataIx({
    program,
    ipAssetPda,
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
