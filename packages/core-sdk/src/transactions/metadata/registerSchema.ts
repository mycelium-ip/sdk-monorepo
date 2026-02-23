import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildRegisterSchemaIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createRegisterSchemaTransaction(params: {
  program: Program<Metadata>;
  schemaCid: string;
  version: string;
  schemaJson: string;
  schemaId: string;
  creator: PublicKey;
}): Promise<{ transaction: Transaction }> {
  const { program, schemaCid, version, creator, schemaJson, schemaId } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildRegisterSchemaIx({
    program,
    schemaCid,
    version,
    creator,
    schemaJson,
    schemaId,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
