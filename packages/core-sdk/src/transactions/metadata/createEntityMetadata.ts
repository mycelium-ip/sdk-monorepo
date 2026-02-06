import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Metadata } from "../../types/metadata";
import { buildCreateEntityMetadataIx } from "../../instructions";

export async function createEntityMetadataTransaction(params: {
  program: Program<Metadata>;
  entityPda: PublicKey;
  schemaPda: PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
  payer: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const { program, entityPda, schemaPda, version, uri, contentHash, payer } =
    params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildCreateEntityMetadataIx({
    program,
    entityPda,
    schemaPda,
    version,
    uri,
    contentHash,
    payer,
  });

  // ─────────────────────────────────────────────
  // 2. Create the transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
