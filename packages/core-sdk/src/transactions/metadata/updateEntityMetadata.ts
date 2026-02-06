import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateEntityMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createUpdateEntityMetadataTransaction(params: {
  program: Program<Metadata>;
  entityPda: PublicKey;
  previousMetadataPda: PublicKey;
  newMetadataPda: PublicKey;
  schemaPda: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    entityPda,
    previousMetadataPda,
    newMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    uri,
    contentHash,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildUpdateEntityMetadataIx({
    program,
    entityPda,
    previousMetadataPda,
    newMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    uri,
    contentHash,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
