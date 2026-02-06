// src/accounts/ipAsset.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * IpAsset on-chain account type
 */
export type IpAsset = {
  entity: anchor.web3.PublicKey; // Entity that owns this IP
  parent: anchor.web3.PublicKey | null; // Parent IP (for derivatives), null if root
  category: number; // Category of IP
  metadataUri: string; // Metadata URI (JSON)
  provenance: string | null; // Provenance info
  status: number; // Status (e.g., active)
  createdAt: anchor.BN; // Creation timestamp
  updatedAt: anchor.BN; // Last updated timestamp
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured IpAsset object
 */
export function decodeIpAsset(
  program: Program<Ipcore>,
  buffer: Buffer,
): IpAsset {
  const accountData = program.coder.accounts.decode("IpAsset", buffer);
  return {
    entity: accountData.entity,
    parent: accountData.parent,
    category: accountData.category,
    metadataUri: accountData.metadataUri,
    provenance: accountData.provenance,
    status: accountData.status,
    createdAt: accountData.createdAt,
    updatedAt: accountData.updatedAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches IpAsset discriminator
 */
export function isIpAssetDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every((byte, i) => byte === IP_ASSET_DISCRIMINATOR[i]);
}

// Anchor-generated discriminator placeholder
const IP_ASSET_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
