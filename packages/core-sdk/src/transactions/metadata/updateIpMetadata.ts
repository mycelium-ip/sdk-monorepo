import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createUpdateIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  entityPda: PublicKey;
  previousMetadataPda: PublicKey;
  newMetadataPda: PublicKey;
  schemaPda: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  version: BN;
  metadataUri: string;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    metadataUri,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildUpdateIpMetadataIx({
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    metadataUri,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
