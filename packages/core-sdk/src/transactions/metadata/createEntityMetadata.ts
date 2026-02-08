import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildCreateEntityMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createEntityMetadataTransaction(params: {
  program: Program<Metadata>;
  entityPda: PublicKey;
  schemaPda: PublicKey;
  version: BN;
  name: string;
  handle: string;
  bio: string;
  pictureUrl: string;
  payer: PublicKey;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    entityPda,
    schemaPda,
    version,
    name,
    handle,
    bio,
    pictureUrl,
    payer,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildCreateEntityMetadataIx({
    program,
    entityPda,
    schemaPda,
    version,
    name,
    handle,
    bio,
    pictureUrl,
    payer,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create the transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
