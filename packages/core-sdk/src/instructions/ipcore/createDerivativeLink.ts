import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";

export type CreateDerivativeLinkIx = {
  instruction: TransactionInstruction;
  derivativeLinkPda: PublicKey;
};

export async function buildCreateDerivativeLinkInstruction(
  program: Program<Ipcore>,
  params: {
    parentIpId: BN;
    childIpId: BN;
    authority: PublicKey;
  },
): Promise<CreateDerivativeLinkIx> {
  const { parentIpId, childIpId, authority } = params;

  // ─────────────────────────────────────────────
  // 1. Derive DerivativeLink PDA
  // ─────────────────────────────────────────────
  const [derivativeLinkPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("derivative_link"),
      parentIpId.toArrayLike(Buffer, "le", 8),
      childIpId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction (no send, no sign)
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .createDerivativeLink(parentIpId, childIpId)
    .accounts({
      derivativeLink: derivativeLinkPda,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return {
    instruction,
    derivativeLinkPda,
  };
}
