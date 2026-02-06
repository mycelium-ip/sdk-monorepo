import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for locking IP metadata
 */
export function buildLockIpMetadataIx(params: {
  program: Program<Metadata>;
  metadataPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  ipAssetPda: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, metadataPda, entityPda, ipAssetPda, authority } = params;

  return program.methods
    .lockIpMetadata()
    .accounts({
      metadata: metadataPda,
      entity: entityPda,
      authority,
      ipAsset: ipAssetPda,
    })
    .instruction();
}
