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
  metadataUri: string;
  payer: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    entityPda,
    schemaPda,
    version,
    metadataUri,
    payer,
    controllers,
  } = params;

  return program.methods
    .createEntityMetadata(version, metadataUri)
    .accounts({
      entity: entityPda,
      schema: schemaPda,
      payer,
    })
    .remainingAccounts(
      controllers.map((kp) => ({
        pubkey: kp,
        isSigner: true,
        isWritable: false,
      })),
    )
    .instruction();
}
