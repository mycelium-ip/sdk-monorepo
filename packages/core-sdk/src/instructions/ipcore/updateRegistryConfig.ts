import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

export async function buildUpdateRegistryConfigIx(params: {
  program: Program<Ipcore>;
  registryConfig: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  newFeeLamports: anchor.BN;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, registryConfig, authority, newFeeLamports } = params;

  return await program.methods
    .updateRegistryConfig(newFeeLamports)
    .accounts({
      registryConfig,
      authority,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
