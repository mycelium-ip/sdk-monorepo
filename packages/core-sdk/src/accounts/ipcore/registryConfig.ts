// src/accounts/registryConfig.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * RegistryConfig on-chain account type
 */
export type RegistryConfig = {
  authority: anchor.web3.PublicKey; // The authority who can update this config
  ipRegistrationFeeLamports: anchor.BN; // Registration fee for new IPs
  createdAt: anchor.BN; // Timestamp when initialized
  updatedAt: anchor.BN; // Timestamp of last update
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured RegistryConfig object
 */
export function decodeRegistryConfig(
  program: Program<Ipcore>,
  buffer: Buffer,
): RegistryConfig {
  const accountData = program.coder.accounts.decode("RegistryConfig", buffer);
  return {
    authority: accountData.authority,
    ipRegistrationFeeLamports: accountData.ipRegistrationFeeLamports,
    createdAt: accountData.createdAt,
    updatedAt: accountData.updatedAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches RegistryConfig discriminator
 */
export function isRegistryConfigDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === REGISTRY_CONFIG_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with real one from IDL)
const REGISTRY_CONFIG_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
