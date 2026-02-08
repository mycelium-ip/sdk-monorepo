import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

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
  controllers: anchor.web3.PublicKey[];
  version: BN;
  name: string;
  handle: string;
  bio: string;
  pictureUrl: string;
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    controllers,
    version,
    name,
    handle,
    bio,
    pictureUrl,
  } = params;

  return program.methods
    .updateEntityMetadata(version, name, handle, bio, pictureUrl)
    .accounts({
      entity: entityPda,
      previousMetadata: previousMetadataPda,
      schema: schemaPda,
      authority,
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
