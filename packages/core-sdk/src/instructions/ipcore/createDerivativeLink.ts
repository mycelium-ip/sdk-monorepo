import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { deriveDerivativeLinkPda } from "../../pda";
import type { Ipcore } from "../../types/ipcore";

export type CreateDerivativeLinkIx = {
  instruction: TransactionInstruction;
  derivativeLinkPda: PublicKey;
};

export async function buildCreateDerivativeLinkInstruction(
  program: Program<Ipcore>,
  params: {
    parentIpPda: PublicKey;
    derivativeIpPda: PublicKey;
    authority: PublicKey;
    license: PublicKey | null;
  },
): Promise<CreateDerivativeLinkIx> {
  const { parentIpPda, derivativeIpPda, authority, license } = params;

  const [derivativeLinkPda] = deriveDerivativeLinkPda(
    parentIpPda,
    derivativeIpPda,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction (no send, no sign)
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .createDerivativeLink(license)
    .accounts({
      authority,
      parentIpAsset: parentIpPda,
      childIpAsset: derivativeIpPda,
    })
    .instruction();

  return {
    instruction,
    derivativeLinkPda,
  };
}
