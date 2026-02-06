// src/accounts/derivativeLink.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

/**
 * DerivativeLink on-chain account type
 */
export type DerivativeLink = {
  parentIpId: anchor.BN; // Parent IP ID
  childIpId: anchor.BN; // Child IP ID
  status: number; // Status of the link (e.g., active)
  createdAt: anchor.BN; // Timestamp when the link was created
  bump: number; // PDA bump
};

/**
 * Decode raw buffer into structured DerivativeLink object
 */
export function decodeDerivativeLink(
  program: Program<Ipcore>,
  buffer: Buffer,
): DerivativeLink {
  const accountData = program.coder.accounts.decode("DerivativeLink", buffer);
  return {
    parentIpId: accountData.parentIpId,
    childIpId: accountData.childIpId,
    status: accountData.status,
    createdAt: accountData.createdAt,
    bump: accountData.bump,
  };
}

/**
 * Optional: check if buffer matches DerivativeLink discriminator
 */
export function isDerivativeLinkDiscriminator(buffer: Buffer): boolean {
  const discriminator = buffer.subarray(0, 8);
  return discriminator.every(
    (byte, i) => byte === DERIVATIVE_LINK_DISCRIMINATOR[i],
  );
}

// Anchor-generated discriminator (example; replace with actual)
const DERIVATIVE_LINK_DISCRIMINATOR = [12, 34, 56, 78, 90, 123, 45, 67];
