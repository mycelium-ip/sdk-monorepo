import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";
import { buildInitEntityTreasuryInstruction } from "../../instructions";

export type InitEntityTreasuryTransactionParams = {
  program: Program<Entity>;
  entityId: Uint8Array;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing an InitEntityTreasury instruction.
 * Does NOT sign or send the transaction.
 */
export async function initEntityTreasuryTransaction({
  program,
  entityId,
  payer,
}: InitEntityTreasuryTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
  entityPda: anchor.web3.PublicKey;
  treasuryPda: anchor.web3.PublicKey;
}> {
  // Build the instruction
  const { instruction, entityPda, treasuryPda } =
    buildInitEntityTreasuryInstruction({ program, entityId, payer });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction, entityPda, treasuryPda };
}
