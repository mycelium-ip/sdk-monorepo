import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Ipcore } from "../../types/ipcore";

export async function buildAddIpAssetInstruction(params: {
  program: Program<Ipcore>;
  ipAsset: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, ipAsset } = params;

  return await program.methods
    .addIpAsset()
    .accounts({
      ipAsset,
    })
    .instruction();
}
