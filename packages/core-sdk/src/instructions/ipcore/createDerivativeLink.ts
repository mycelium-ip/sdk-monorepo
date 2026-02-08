import type { BN, Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { deriveDerivativeLinkPda, deriveIPAssetPda } from "../../pda";
import type { Ipcore } from "../../types/ipcore";

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
    controllers: PublicKey[];
  },
): Promise<CreateDerivativeLinkIx> {
  const { parentIpId, childIpId, authority, entityPda, controllers } = params;

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
