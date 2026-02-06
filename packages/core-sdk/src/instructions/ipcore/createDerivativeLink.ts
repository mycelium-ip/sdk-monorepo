import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import * as anchor from "@coral-xyz/anchor";
import { deriveDerivativeLinkPda, deriveIPAssetPda } from "../../pda";

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

  const [childIpPda] = deriveIPAssetPda(entityPda, childIpId);

  const [parentIpPda] = deriveIPAssetPda(entityPda, parentIpId);

  const [derivativeLinkPda] = deriveDerivativeLinkPda(parentIpId, childIpId);

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
