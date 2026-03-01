import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import { encodePaddedAscii } from "../../helper";
import { MAX_SCHEMA_CID_LEN } from "../../constants";

/**
 * Build the instruction for creating IP metadata
 */
export async function buildCreateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  version: BN;
  metadataCid: string;
  payer: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    metadataCid,
    payer,
    controllers,
  } = params;
  const ipCidResult = encodePaddedAscii(metadataCid, MAX_SCHEMA_CID_LEN);
  return program.methods
    .createIpMetadata(version, [...ipCidResult])
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
