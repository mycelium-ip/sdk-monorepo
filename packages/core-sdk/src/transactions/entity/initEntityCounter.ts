import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { buildInitEntityCounterInstruction } from "../../instructions";
import type { Entity } from "../../types/entity";

export type InitEntityCounterTransactionParams = {
  program: Program<Entity>;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing an InitEntityCounter instruction.
 * Does NOT sign or send the transaction.
 */
export async function initEntityCounterTransaction({
  program,
  payer,
}: InitEntityCounterTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  // Build the instruction
  const instruction = await buildInitEntityCounterInstruction({
    program,
    payer,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(instruction);

  return { transaction };
}
