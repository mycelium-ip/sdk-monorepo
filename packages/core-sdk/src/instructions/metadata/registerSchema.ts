import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for registering a schema
 */
export async function buildRegisterSchemaIx(params: {
  program: Program<Metadata>;
  category: string;
  schemaUri: string;
  version: number;
  creator: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, category, schemaUri, version, creator } = params;

  return program.methods
    .registerSchema(category, schemaUri, version)
    .accounts({
      creator,
    })
    .instruction();
}
