import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildCreateDerivativeLinkInstruction } from "../../instructions";

export type CreateDerivativeLinkTransactionParams = {
  program: Program<Ipcore>;
  parentIpId: BN;
  childIpId: BN;
  authority: anchor.web3.PublicKey;
};

/**
 * Returns a Transaction containing the createDerivativeLink instruction.
 * Does NOT sign or send the transaction.
 */
export async function createDerivativeLinkTransaction({
  program,
  parentIpId,
  childIpId,
  authority,
}: CreateDerivativeLinkTransactionParams): Promise<{
  transaction: Transaction;
  derivativeLinkPda: anchor.web3.PublicKey;
}> {
  // Build the instruction
  const { instruction, derivativeLinkPda } =
    await buildCreateDerivativeLinkInstruction(program, {
      parentIpId,
      childIpId,
      authority,
    });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction, derivativeLinkPda };
}
