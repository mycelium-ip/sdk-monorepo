import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";
import { buildUpdateControllersInstruction } from "../../instructions";

export type UpdateControllersTransactionParams = {
  program: Program<Entity>;
  entityId: Uint8Array;
  newControllers: anchor.web3.PublicKey[];
  newThreshold: number;
  approvingControllers: anchor.web3.PublicKey[];
};

/**
 * Returns a Transaction containing an UpdateControllers instruction.
 * Does NOT sign or send the transaction.
 */
export async function updateControllersTransaction({
  program,
  entityId,
  newControllers,
  newThreshold,
  approvingControllers,
}: UpdateControllersTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
  entityPda: anchor.web3.PublicKey;
}> {
  // Build the instruction
  const { instruction, entityPda } = buildUpdateControllersInstruction({
    program,
    entityId,
    newControllers,
    newThreshold,
    approvingControllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction, entityPda };
}
