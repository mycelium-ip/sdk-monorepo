import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

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
