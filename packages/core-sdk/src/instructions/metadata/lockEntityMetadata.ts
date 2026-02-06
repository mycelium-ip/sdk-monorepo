import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for locking entity metadata
 */
export function buildLockEntityMetadataIx(params: {
  program: Program<Metadata>;
  metadataPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, metadataPda, entityPda, authority } = params;

  return program.methods
    .lockEntityMetadata()
    .accounts({
      metadata: metadataPda,
      entity: entityPda,
      authority,
    })
    .instruction();
}
