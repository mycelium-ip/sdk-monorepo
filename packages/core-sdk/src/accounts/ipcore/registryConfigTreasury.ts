// src/accounts/registryConfigTreasury.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * RegistryConfigTreasury on-chain account type
 */
export type RegistryConfigTreasury = {
  authority: anchor.web3.PublicKey; // Authority allowed to manage the treasury
  createdAt: anchor.BN; // Timestamp when the treasury was initialized
};

/**
 * Decode raw buffer into structured RegistryConfigTreasury object
 */
export function decodeRegistryConfigTreasury(
  program: Program<Ipcore>,
  buffer: Buffer,
): RegistryConfigTreasury {
  const accountData = program.coder.accounts.decode(
    "RegistryConfigTreasury",
    buffer,
  );
  return {
    authority: accountData.authority,
    createdAt: accountData.createdAt,
  };
}

/**
 * Optional: check if buffer matches RegistryConfigTreasury discriminator
 */
export function isRegistryConfigTreasuryDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === REGISTRY_CONFIG_TREASURY_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with actual IDL discriminator)
const REGISTRY_CONFIG_TREASURY_DISCRIMINATOR = [
  12, 34, 56, 78, 90, 123, 45, 67,
];
