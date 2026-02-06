import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * Build the instruction for updating entity metadata
 */
export async function buildUpdateEntityMetadataIx(params: {
  program: Program<Metadata>;
  entityPda: anchor.web3.PublicKey;
  previousMetadataPda: anchor.web3.PublicKey;
  newMetadataPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    uri,
    contentHash,
  } = params;

  return program.methods
    .updateEntityMetadata(version, uri, contentHash)
    .accounts({
      entity: entityPda,
      previousMetadata: previousMetadataPda,
      schema: schemaPda,
      authority,
      payer,
    })
    .instruction();
}
