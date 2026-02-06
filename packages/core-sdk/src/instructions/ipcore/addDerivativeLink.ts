import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Ipcore } from "../../types/ipcore";

export type AddDerivativeLinkIx = {
  instruction: TransactionInstruction;
};

export async function buildAddDerivativeLinkInstruction(
  program: Program<Ipcore>,
  params: {
    derivativeLink: PublicKey;
  },
): Promise<AddDerivativeLinkIx> {
  const { derivativeLink } = params;

  const instruction = await program.methods
    .addDerivativeLink()
    .accounts({
      derivativeLink,
    })
    .instruction();

  return { instruction };
}
