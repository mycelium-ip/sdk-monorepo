import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildCreateIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  schemaPda: PublicKey;
  entityPda: PublicKey;
  version: BN;
  metadataUri: string;
  payer: PublicKey;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    metadataUri,
    payer,
    controllers,
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
    metadataUri,
    payer,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create the transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
