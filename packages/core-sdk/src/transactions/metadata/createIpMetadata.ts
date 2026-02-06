import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Metadata } from "../../types/metadata";
import { buildCreateIpMetadataIx } from "../../instructions";

export async function createIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  schemaPda: PublicKey;
  entityPda: PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
  payer: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    uri,
    contentHash,
    payer,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildCreateIpMetadataIx({
    program,
    ipAssetPda,
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
