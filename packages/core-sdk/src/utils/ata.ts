import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";

/**
 * Derive the Associated Token Account (ATA) address for a given mint and owner.
 *
 * This is a synchronous operation that does not require an RPC call.
 * The ATA may or may not exist on-chain.
 *
 * @param mint  - The SPL token mint address
 * @param owner - The wallet address that owns the ATA
 * @returns The derived ATA address
 */
export function deriveAta(mint: PublicKey, owner: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner);
}
