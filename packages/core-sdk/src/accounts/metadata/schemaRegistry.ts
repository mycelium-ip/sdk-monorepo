// src/accounts/schemaRegistry.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * SchemaRegistry on-chain account type
 */
export type SchemaRegistry = {
  category: string; // Category of the schema, e.g., "music"
  schemaUri: string; // URI pointing to schema data (e.g., IPFS)
  version: number; // Schema version
  creator: anchor.web3.PublicKey; // Wallet that created the schema
  bump: number; // PDA bump for validation
};

/**
 * Decode raw buffer into structured SchemaRegistry object
 */
export function decodeSchemaRegistry(
  program: Program<Metadata>,
  buffer: Buffer,
): SchemaRegistry {
  const accountData = program.coder.accounts.decode("SchemaRegistry", buffer);
  return {
    category: accountData.category,
    schemaUri: accountData.schemaUri,
    version: accountData.version,
    creator: accountData.creator,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches SchemaRegistry discriminator
 */
export function isSchemaRegistryDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === SCHEMA_REGISTRY_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with actual IDL discriminator)
const SCHEMA_REGISTRY_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
