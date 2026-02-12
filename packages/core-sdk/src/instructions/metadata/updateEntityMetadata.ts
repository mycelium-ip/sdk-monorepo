import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import { encodePaddedAscii } from "../../helper";
import { MAX_SCHEMA_URI_LEN } from "../../constants";

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
  metadataUri: string;
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
    metadataUri,
  } = params;
  const entityUriResult = encodePaddedAscii(metadataUri, MAX_SCHEMA_URI_LEN);
  return program.methods
    .updateEntityMetadata(version, [...entityUriResult])
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
