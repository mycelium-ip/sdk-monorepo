import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";

/**
 * Build the instruction for creating IP metadata
 */
export async function buildCreateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  version: BN;
  metadataUri: string;
  payer: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    metadataUri,
    payer,
    controllers,
  } = params;

  return program.methods
    .createIpMetadata(version, metadataUri)
    .accounts({
      ipAsset: ipAssetPda,
      schema: schemaPda,
      payer,
      entity: entityPda,
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
