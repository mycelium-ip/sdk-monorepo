import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildLockEntityMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createLockEntityMetadataTransaction(params: {
  program: Program<Metadata>;
  metadataPda: PublicKey;
  entityPda: PublicKey;
  authority: PublicKey;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const { program, metadataPda, entityPda, authority, controllers } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildLockEntityMetadataIx({
    program,
    metadataPda,
    entityPda,
    authority,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
