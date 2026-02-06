// src/accounts/moduleConfig.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * ModuleConfig on-chain account type
 */
export type ModuleConfig = {
  ipAsset: anchor.web3.PublicKey; // Associated IP asset
  allowedModules: anchor.web3.PublicKey[]; // List of allowed module PDAs
  createdAt: anchor.BN; // Timestamp when this config was initialized
  updatedAt: anchor.BN; // Timestamp for last update
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured ModuleConfig object
 */
export function decodeModuleConfig(
  program: Program<Ipcore>,
  buffer: Buffer,
): ModuleConfig {
  const accountData = program.coder.accounts.decode("ModuleConfig", buffer);
  return {
    ipAsset: accountData.ipAsset,
    allowedModules: accountData.allowedModules,
    createdAt: accountData.createdAt,
    updatedAt: accountData.updatedAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches ModuleConfig discriminator
 */
export function isModuleConfigDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === MODULE_CONFIG_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator placeholder (replace with real one from IDL)
const MODULE_CONFIG_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
