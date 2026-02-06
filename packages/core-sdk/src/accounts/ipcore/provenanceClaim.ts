// src/accounts/provenanceClaim.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * ProvenanceClaim on-chain account type
 */
export type ProvenanceClaim = {
  ipAsset: anchor.web3.PublicKey; // IP asset this claim is associated with
  entity: anchor.web3.PublicKey; // Entity that owns the IP
  creator: anchor.web3.PublicKey; // Wallet that created this claim
  evidenceHash: Buffer; // 32-byte evidence hash
  uri: string; // URI pointing to the evidence/proof
  status: number; // Status of the claim (active, verified, etc.)
  createdAt: anchor.BN; // Timestamp when claim was created
  updatedAt: anchor.BN; // Timestamp when claim was updated
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured ProvenanceClaim object
 */
export function decodeProvenanceClaim(
  program: Program<Ipcore>,
  buffer: Buffer,
): ProvenanceClaim {
  const accountData = program.coder.accounts.decode("ProvenanceClaim", buffer);
  return {
    ipAsset: accountData.ipAsset,
    entity: accountData.entity,
    creator: accountData.creator,
    evidenceHash: accountData.evidenceHash,
    uri: accountData.uri,
    status: accountData.status,
    createdAt: accountData.createdAt,
    updatedAt: accountData.updatedAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches ProvenanceClaim discriminator
 */
export function isProvenanceClaimDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === PROVENANCE_CLAIM_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder
const PROVENANCE_CLAIM_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
