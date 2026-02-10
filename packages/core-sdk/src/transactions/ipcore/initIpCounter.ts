import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { buildInitIpCounterInstruction } from "../../instructions/ipcore/initIpCounter";
import { Ipcore } from "../../types";

export type InitIpCounterTransactionParams = {
  program: Program<Ipcore>;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing an InitIpCounter instruction.
 * Does NOT sign or send the transaction.
 */
export async function initIpCounterTransaction({
  program,
  payer,
}: InitIpCounterTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  // Build the instruction
  const instruction = await buildInitIpCounterInstruction({
    program,
    payer,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(instruction);

  return { transaction };
}
