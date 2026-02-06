import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import { buildAddIpAssetInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export type AddIpAssetTransactionParams = {
  program: Program<Ipcore>;
  ipAsset: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing the addIpAsset instruction.
 * Does NOT sign or send the transaction.
 */
export async function addIpAssetTransaction({
  program,
  ipAsset,
}: AddIpAssetTransactionParams): Promise<{ transaction: Transaction }> {
  // Build the instruction
  const instruction = await buildAddIpAssetInstruction({ program, ipAsset });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
