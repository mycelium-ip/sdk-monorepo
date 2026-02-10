import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { buildInitEntityTreasuryInstruction } from "../../instructions";
import type { Entity } from "../../types/entity";

export type InitEntityTreasuryTransactionParams = {
  program: Program<Entity>;
  entityPda: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
};

/**
 * Returns a Transaction containing an InitEntityTreasury instruction.
 * Does NOT sign or send the transaction.
 */
export async function initEntityTreasuryTransaction({
  program,
  entityPda,
  payer,
  controllers,
}: InitEntityTreasuryTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  // Build the instruction
  const { instruction } = buildInitEntityTreasuryInstruction({
    program,
    entityPda,
    payer,
    controllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction };
}
