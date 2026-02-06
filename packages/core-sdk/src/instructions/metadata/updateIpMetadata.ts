import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for updating IP metadata
 */
export async function buildUpdateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  previousMetadataPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    ipAssetPda,
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
    .updateIpMetadata(version, uri, contentHash)
    .accounts({
      ipAsset: ipAssetPda,
      entity: entityPda,
      previousMetadata: previousMetadataPda,
      schema: schemaPda,
      authority,
      payer,
    })
    .instruction();
}
