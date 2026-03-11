import type { AccountMeta, PublicKey } from "@solana/web3.js";

/**
 * Build readonly-signer `AccountMeta` entries from an array of controller
 * public keys. These are passed as `remainingAccounts` to Anchor instructions
 * that validate entity authority via `remaining_accounts`.
 */
export function buildSignerMetas(signers?: PublicKey[]): AccountMeta[] {
  if (!signers || signers.length === 0) return [];
  return signers.map((pubkey) => ({
    pubkey,
    isSigner: true,
    isWritable: false,
  }));
}
