import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

export async function buildInitializeRegistryConfigTreasuryIx(params: {
  program: Program<Ipcore>;
  registryConfigTreasury: anchor.web3.PublicKey;
  registryConfig: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, registryConfigTreasury, registryConfig, authority } = params;

  return await program.methods
    .initializeRegistryConfigTreasury()
    .accounts({
      registryConfigTreasury,
      registryConfig,
      authority,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
