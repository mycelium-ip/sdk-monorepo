import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { buildUpdateControllersInstruction } from "../../instructions";
import type { Entity } from "../../types/entity";

export type UpdateControllersTransactionParams = {
  program: Program<Entity>;
  entityId: Uint8Array;
  newControllers: anchor.web3.PublicKey[];
  newThreshold: number;
  controllers: anchor.web3.PublicKey[];
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
  controllers,
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
    controllers,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction, entityPda };
}
