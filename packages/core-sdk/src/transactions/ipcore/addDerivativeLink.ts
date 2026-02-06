import { Program } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildAddDerivativeLinkInstruction } from "../../instructions";

export type AddDerivativeLinkTransactionParams = {
  program: Program<Ipcore>;
  registry: PublicKey;
  derivativeLink: PublicKey;
};

/**
 * Returns a Transaction containing the addDerivativeLink instruction.
 * Does NOT sign or send the transaction.
 */
export async function addDerivativeLinkTransaction({
  program,
  registry,
  derivativeLink,
}: AddDerivativeLinkTransactionParams): Promise<{
  transaction: Transaction;
}> {
  // Build the instruction
  const { instruction } = await buildAddDerivativeLinkInstruction(program, {
    registry,
    derivativeLink,
  });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
