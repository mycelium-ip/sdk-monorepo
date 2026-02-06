// src/accounts/entityMetadata.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * EntityMetadata on-chain account type
 */
export type EntityMetadata = {
  entity: anchor.web3.PublicKey; // PDA of the EntityAccount
  schema: anchor.web3.PublicKey; // PDA of the associated schema
  version: anchor.BN; // Metadata version
  uri: string; // URI of metadata JSON
  contentHash: Buffer; // Content hash of metadata
  createdAt: anchor.BN; // Timestamp when metadata was created
  locked: boolean; // Whether the metadata is locked
};

/**
 * Decode raw buffer into structured EntityMetadata object
 */
export function decodeEntityMetadata(
  program: Program<Metadata>,
  buffer: Buffer,
): EntityMetadata {
  const accountData = program.coder.accounts.decode("EntityMetadata", buffer);
  return {
    entity: accountData.entity,
    schema: accountData.schema,
    version: accountData.version,
    uri: accountData.uri,
    contentHash: Buffer.from(accountData.contentHash),
    createdAt: accountData.createdAt,
    locked: accountData.locked,
  };
}

/**
 * Optional: check if buffer matches EntityMetadata discriminator
 */
export function isEntityMetadataDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === ENTITY_METADATA_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with actual IDL discriminator)
const ENTITY_METADATA_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
