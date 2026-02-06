import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * Build the instruction for creating IP metadata
 */
export async function buildCreateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
  payer: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    uri,
    contentHash,
    payer,
  } = params;

  return program.methods
    .createIpMetadata(version, uri, contentHash)
    .accounts({
      ipAsset: ipAssetPda,
      schema: schemaPda,
      payer,
      entity: entityPda,
    })
    .instruction();
}
