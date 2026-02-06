import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildAddDerivativeLinkInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export type AddDerivativeLinkTransactionParams = {
  program: Program<Ipcore>;
  derivativeLink: PublicKey;
};

/**
 * Returns a Transaction containing the addDerivativeLink instruction.
 * Does NOT sign or send the transaction.
 */
export async function addDerivativeLinkTransaction({
  program,
  derivativeLink,
}: AddDerivativeLinkTransactionParams): Promise<{
  transaction: Transaction;
}> {
  // Build the instruction
  const { instruction } = await buildAddDerivativeLinkInstruction(program, {
    derivativeLink,
  });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
