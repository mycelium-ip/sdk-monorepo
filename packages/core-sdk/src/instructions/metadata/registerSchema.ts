import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Metadata } from "../../types/metadata";
import { createHash } from "crypto";

export const MAX_SCHEMA_ID_LEN = 32;
export const MAX_VERSION_LEN = 16;
export const MAX_SCHEMA_URI_LEN = 96;

export function encodePaddedAscii(input: string, maxLen: number): Uint8Array {
  if (!/^[\x00-\x7F]*$/.test(input)) {
    throw new Error("Non-ASCII characters are not allowed");
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  if (bytes.length > maxLen) {
    throw new Error(`Input too long. Max length is ${maxLen}`);
  }

  const padded = new Uint8Array(maxLen);
  padded.set(bytes); // remaining bytes stay 0x00
  return padded;
}

export function sha256(data: string): Uint8Array {
  const hash = createHash("sha256").update(data).digest();
  return new Uint8Array(hash);
}

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
