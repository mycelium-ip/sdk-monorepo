// src/accounts/entityTreasury.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";

/**
 * EntityTreasury type definition
 * Represents what is stored on-chain for an entity's treasury
 */
export type EntityTreasury = {
  entity: anchor.web3.PublicKey; // The entity this treasury belongs to
  version: number; // Version number of the treasury account
  balance: anchor.BN; // Current balance (optional, if tracked on-chain)
  createdAt: anchor.BN; // Timestamp of treasury creation
  bump: number; // PDA bump for validation
};

/**
 * Decode raw account buffer into a structured EntityTreasury object
 */
export function decodeEntityTreasury(
  program: Program<Entity>,
  buffer: Buffer,
): EntityTreasury {
  const accountData = program.coder.accounts.decode("EntityTreasury", buffer);
  return {
    entity: accountData.entity,
    version: accountData.version,
    balance: accountData.balance ?? new anchor.BN(0),
    createdAt: accountData.createdAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if a buffer matches the EntityTreasury discriminator
 */
export function isEntityTreasuryDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === ENTITY_TREASURY_DISCRIMINATOR[i],
  );
}

// Example discriminator (anchor generates this automatically in the IDL)
const ENTITY_TREASURY_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
