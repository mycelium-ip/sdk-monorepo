import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import { MAX_SCHEMA_URI_LEN } from "../../constants";
import { encodePaddedAscii } from "../../helper";

/**
 * Build the instruction for updating IP metadata
 */
export async function buildUpdateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  previousMetadataPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
  version: BN;
  controllers: anchor.web3.PublicKey[];
  metadataUri: string;
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    schemaPda,
    payer,
    version,
    controllers,
    metadataUri,
  } = params;
  const ipUriResult = encodePaddedAscii(metadataUri, MAX_SCHEMA_URI_LEN);
  return program.methods
    .updateIpMetadata(version, [...ipUriResult])
    .accounts({
      ipAsset: ipAssetPda,
      entity: entityPda,
      previousMetadata: previousMetadataPda,
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
