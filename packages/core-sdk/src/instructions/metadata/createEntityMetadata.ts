import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import { encodePaddedAscii } from "../../helper";
import { MAX_SCHEMA_URI_LEN } from "../../constants";

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
  const entityUriResult = encodePaddedAscii(metadataUri, MAX_SCHEMA_URI_LEN);
  return program.methods
    .createEntityMetadata(version, [...entityUriResult])
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
