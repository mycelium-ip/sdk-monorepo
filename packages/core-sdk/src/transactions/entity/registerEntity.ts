import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";
import { buildRegisterEntityInstruction } from "../../instructions";

export type CreateEntityTransactionParams = {
  program: Program<Entity>;
  entityId: Uint8Array;
  controllers: anchor.web3.PublicKey[];
  threshold: number;
  payer: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing a RegisterEntity instruction
 * Does NOT sign or send the transaction
 */
export async function createEntityTransaction({
  program,
  entityId,
  controllers,
  threshold,
  payer,
}: CreateEntityTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
  entityPda: anchor.web3.PublicKey;
}> {
  // Build the instruction using our reusable helper
  const { instruction, entityPda } = buildRegisterEntityInstruction({
    program,
    entityId,
    controllers,
    threshold,
    payer,
  });

  // Create a transaction and add the instruction
  const transaction = new anchor.web3.Transaction().add(await instruction);

  return { transaction, entityPda };
}
