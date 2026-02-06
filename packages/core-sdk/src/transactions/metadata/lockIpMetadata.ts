import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildLockIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createLockIpMetadataTransaction(params: {
  program: Program<Metadata>;
  metadataPda: PublicKey;
  ipAssetPda: PublicKey;
  entityPda: PublicKey;
  authority: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const { program, metadataPda, ipAssetPda, entityPda, authority } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildLockIpMetadataIx({
    program,
    metadataPda,
    entityPda,
    ipAssetPda,
    authority,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
