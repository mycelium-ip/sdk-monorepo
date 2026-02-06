import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";

/**
 * EntityAccount type definition
 * Represents what is stored on-chain for an entity
 */
export type EntityAccount = {
  status: number; // Entity status (e.g., 1 = active)
  controllerThreshold: number; // Number of controllers required to authorize actions
  controllers: anchor.web3.PublicKey[]; // Controller public keys
  creator: anchor.web3.PublicKey; // Wallet that created the entity
  createdAt: anchor.BN; // Timestamp of creation
  updatedAt: anchor.BN; // Timestamp of last update
  bump: number; // PDA bump for validation
};

/**
 * Decode raw account buffer into a structured EntityAccount object
 */
export function decodeEntityAccount(
  program: Program<Entity>,
  buffer: Buffer,
): EntityAccount {
  const accountData = program.coder.accounts.decode("EntityAccount", buffer);
  return {
    status: accountData.status,
    controllerThreshold: accountData.controllerThreshold,
    controllers: accountData.controllers,
    creator: accountData.creator,
    createdAt: accountData.createdAt,
    updatedAt: accountData.updatedAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if a buffer matches the EntityAccount discriminator
 */
export function isEntityAccountDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === ENTITY_ACCOUNT_DISCRIMINATOR[i],
  );
}

// Example discriminator (anchor generates this)
const ENTITY_ACCOUNT_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
