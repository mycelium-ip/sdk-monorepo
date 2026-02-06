import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

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

  // Derive the schema PDA
  const [schemaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("schema"),
      Buffer.from(category),
      Buffer.from(Uint8Array.of(version, version >> 8)), // u16 LE
    ],
    program.programId,
  );

  return program.methods
    .registerSchema(category, schemaUri, version)
    .accounts({
      schema: schemaPda,
      creator,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
