import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * Build the instruction for creating entity metadata
 */
export async function buildCreateEntityMetadataIx(params: {
  program: Program<Metadata>;
  entityPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
  payer: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, entityPda, schemaPda, version, uri, contentHash, payer } =
    params;

  // Derive the entity metadata PDA
  const [entityMetadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("entity_metadata"),
      entityPda.toBuffer(),
      version.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  return program.methods
    .createEntityMetadata(version, uri, contentHash)
    .accounts({
      entityMetadata: entityMetadataPda,
      entity: entityPda,
      schema: schemaPda,
      payer,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
