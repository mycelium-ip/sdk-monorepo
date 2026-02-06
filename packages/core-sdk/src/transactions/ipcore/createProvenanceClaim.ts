import { Program } from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildCreateProvenanceClaimInstruction } from "../../instructions";

export type CreateProvenanceClaimTransactionParams = {
  program: Program<Ipcore>;
  ipAsset: PublicKey;
  entity: PublicKey;
  entityProgram: PublicKey;
  payer: PublicKey;

  evidenceHash: Buffer;
  uri: string;

  controllers: PublicKey[];
};

/**
 * Returns a Transaction containing the createProvenanceClaim instruction.
 * Does NOT sign or send the transaction.
 */
export async function createProvenanceClaimTransaction({
  program,
  ipAsset,
  entity,
  entityProgram,
  payer,
  evidenceHash,
  uri,
  controllers,
}: CreateProvenanceClaimTransactionParams): Promise<{
  transaction: Transaction;
  provenancePda: PublicKey;
}> {
  // Build the instruction
  const { instruction, provenancePda } =
    await buildCreateProvenanceClaimInstruction(program, {
      ipAsset,
      entity,
      entityProgram,
      payer,
      evidenceHash,
      uri,
      controllers,
    });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction, provenancePda };
}
