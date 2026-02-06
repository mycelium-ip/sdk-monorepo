// src/accounts/ipRegistry.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * IPRegistry on-chain account type
 */
export type IpRegistry = {
  totalIps: anchor.BN; // Total number of IP assets registered
  ipAssets: anchor.web3.PublicKey[]; // List of IP asset PDAs
  derivativeLinks: anchor.web3.PublicKey[]; // List of derivative links PDAs
  createdAt: anchor.BN; // Timestamp of registry creation
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured IpRegistry object
 */
export function decodeIpRegistry(
  program: Program<Ipcore>,
  buffer: Buffer,
): IpRegistry {
  const accountData = program.coder.accounts.decode("IpRegistry", buffer);
  return {
    totalIps: accountData.totalIps,
    ipAssets: accountData.ipAssets,
    derivativeLinks: accountData.derivativeLinks,
    createdAt: accountData.createdAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches IpRegistry discriminator
 */
export function isIpRegistryDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === IP_REGISTRY_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator (for reference)
const IP_REGISTRY_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
