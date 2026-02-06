import { Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";
import { PublicKey, Transaction } from "@solana/web3.js";
import { buildRegisterSchemaIx } from "../../instructions";

export async function createRegisterSchemaTransaction(params: {
  program: Program<Metadata>;
  category: string;
  schemaUri: string;
  version: number;
  creator: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const { program, category, schemaUri, version, creator } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildRegisterSchemaIx({
    program,
    category,
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
