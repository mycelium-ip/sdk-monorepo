import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

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

  return program.methods
    .createEntityMetadata(version, uri, contentHash)
    .accounts({
      entity: entityPda,
      schema: schemaPda,
      payer,
    })
    .instruction();
}
