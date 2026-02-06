import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

export async function buildInitializeRegistryConfigIx(params: {
  program: Program<Ipcore>;
  registryConfig: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
  feeLamports: anchor.BN;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, registryConfig, authority, feeLamports } = params;

  return await program.methods
    .initializeRegistryConfig(feeLamports)
    .accounts({
      registryConfig,
      authority,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
