import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import { buildCreateDerivativeLinkInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export type CreateDerivativeLinkTransactionParams = {
  program: Program<Ipcore>;
  parentIpPda: anchor.web3.PublicKey;
  derivativeIpPda: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  license: anchor.web3.PublicKey | null;
};

/**
 * Returns a Transaction containing the createDerivativeLink instruction.
 * Does NOT sign or send the transaction.
 */
export async function createDerivativeLinkTransaction({
  program,
  parentIpPda,
  derivativeIpPda,
  authority,
  license,
}: CreateDerivativeLinkTransactionParams): Promise<{
  transaction: Transaction;
  derivativeLinkPda: anchor.web3.PublicKey;
}> {
  // Build the instruction
  const { instruction, derivativeLinkPda } =
    await buildCreateDerivativeLinkInstruction(program, {
      parentIpPda,
      derivativeIpPda,
      authority,
      license,
    });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction, derivativeLinkPda };
}
