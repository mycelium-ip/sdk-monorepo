import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Ipcore } from "../../types/ipcore";

export async function buildInitializeRegistryConfigIx(params: {
  program: Program<Ipcore>;
  authority: anchor.web3.PublicKey;
  feeLamports: anchor.BN;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, authority, feeLamports } = params;

  return await program.methods
    .initRegistryConfig(feeLamports)
    .accounts({
      authority,
    })
    .instruction();
}
