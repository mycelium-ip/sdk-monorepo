import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for registering a schema
 */
export async function buildRegisterSchemaIx(params: {
  program: Program<Metadata>;
  schemaUri: string;
  version: anchor.BN;
  creator: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, schemaUri, version, creator } = params;

  return program.methods
    .registerSchema(version, schemaUri)
    .accounts({
      creator,
    })
    .instruction();
}
