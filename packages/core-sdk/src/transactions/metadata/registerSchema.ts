import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildRegisterSchemaIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";
import { BN } from "@coral-xyz/anchor";

export async function createRegisterSchemaTransaction(params: {
  program: Program<Metadata>;
  schemaUri: string;
  version: BN;
  creator: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const { program, schemaUri, version, creator } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildRegisterSchemaIx({
    program,
    schemaUri,
    version,
    creator,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
