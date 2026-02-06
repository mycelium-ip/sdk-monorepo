import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import * as anchor from "@coral-xyz/anchor";

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
    entityPda: PublicKey;
  },
): Promise<CreateDerivativeLinkIx> {
  const { parentIpId, childIpId, authority, entityPda } = params;

  const [childIpPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ip_asset"),
      entityPda.toBuffer(),
      childIpId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  const [parentIpPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ip_asset"),
      entityPda.toBuffer(),
      parentIpId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

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
      authority,
      parentIpAsset: parentIpPda,
      childIpAsset: childIpPda,
    })
    .instruction();

  return {
    instruction,
    derivativeLinkPda,
  };
}
