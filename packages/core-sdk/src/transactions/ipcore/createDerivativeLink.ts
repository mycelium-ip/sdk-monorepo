import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import { buildCreateDerivativeLinkInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export type CreateDerivativeLinkTransactionParams = {
  program: Program<Ipcore>;
  parentIpId: BN;
  childIpId: BN;
  authority: anchor.web3.PublicKey;
  entityPda: anchor.web3.PublicKey;
  license: anchor.web3.PublicKey;
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
  entityPda,
  license,
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
      entityPda,
      license,
    });

  // Create a transaction and add the instruction
  const transaction = new Transaction().add(instruction);

  return { transaction, derivativeLinkPda };
}
