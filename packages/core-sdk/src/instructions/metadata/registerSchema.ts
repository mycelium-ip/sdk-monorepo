import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import {
  MAX_SCHEMA_ID_LEN,
  MAX_SCHEMA_URI_LEN,
  MAX_VERSION_LEN,
} from "../../constants";
import { encodePaddedAscii, sha256 } from "../../helper";

/**
 * Build the instruction for registering a schema
 */
export async function buildRegisterSchemaIx(params: {
  program: Program<Metadata>;
  schemaUri: string;
  version: string;
  schemaJson: string;
  schemaId: string;
  creator: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, schemaUri, version, schemaJson, schemaId, creator } = params;
  const schemaHashResult = sha256(schemaJson);
  const schemaIdResult = encodePaddedAscii(schemaId, MAX_SCHEMA_ID_LEN);
  const versionResult = encodePaddedAscii(version, MAX_VERSION_LEN);
  const schemaUriResult = encodePaddedAscii(schemaUri, MAX_SCHEMA_URI_LEN);

  return program.methods
    .registerSchema(
      [...schemaIdResult],
      [...versionResult],
      [...schemaHashResult],
      [...schemaUriResult],
    )
    .accounts({
      creator,
    })
    .instruction();
}
