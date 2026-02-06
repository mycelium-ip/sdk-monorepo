// src/accounts/ipMetadata.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * IpMetadata on-chain account type
 */
export type IpMetadata = {
  ipAsset: anchor.web3.PublicKey; // PDA of the IP asset
  schema: anchor.web3.PublicKey; // PDA of the associated schema
  version: anchor.BN; // Metadata version
  uri: string; // Metadata URI
  contentHash: Buffer; // Hash of the metadata content
  createdAt: anchor.BN; // Timestamp of creation
  locked: boolean; // Locked status
};

/**
 * Decode raw buffer into structured IpMetadata object
 */
export function decodeIpMetadata(
  program: Program<Metadata>,
  buffer: Buffer,
): IpMetadata {
  const accountData = program.coder.accounts.decode("IpMetadata", buffer);
  return {
    ipAsset: accountData.ipAsset,
    schema: accountData.schema,
    version: accountData.version,
    uri: accountData.uri,
    contentHash: Buffer.from(accountData.contentHash),
    createdAt: accountData.createdAt,
    locked: accountData.locked,
  };
}

/**
 * Optional: check if buffer matches IpMetadata discriminator
 */
export function isIpMetadataDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === IP_METADATA_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with actual IDL discriminator)
const IP_METADATA_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
