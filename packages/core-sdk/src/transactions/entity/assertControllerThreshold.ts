import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { buildAssertControllerThresholdInstruction } from "../../instructions";
import type { Entity } from "../../types/entity";

export type AssertControllerThresholdTransactionParams = {
  program: Program<Entity>;
  entityId: Uint8Array;
  approvingControllers: anchor.web3.PublicKey[];
};

/**
 * Returns a Transaction containing an AssertControllerThreshold instruction.
 * Does NOT sign or send the transaction.
 */
export async function assertControllerThresholdTransaction({
  program,
  entityId,
  approvingControllers,
}: AssertControllerThresholdTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
  entityPda: anchor.web3.PublicKey;
}> {
  // Build the instruction
  const { instruction, entityPda } = buildAssertControllerThresholdInstruction({
    program,
    entityId,
    approvingControllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction, entityPda };
}
