import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Ipcore } from "../../types/ipcore";

export async function buildInitModuleConfigInstruction(params: {
  program: Program<Ipcore>;
  ipAsset: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, ipAsset, payer } = params;

  return await program.methods
    .initModuleConfig()
    .accounts({
      ipAsset,
      payer,
    })
    .instruction();
}
