import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Ipcore } from "../../types/ipcore";

export async function buildUpdateRegistryConfigIx(params: {
  program: Program<Ipcore>;
  registryConfig: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  newFeeLamports: anchor.BN;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, authority, newFeeLamports } = params;

  return await program.methods
    .updateRegistryConfig(newFeeLamports)
    .accounts({
      authority,
    })
    .instruction();
}
