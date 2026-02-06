import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Ipcore } from "../../types/ipcore";

export async function buildInitializeRegistryConfigTreasuryIx(params: {
  program: Program<Ipcore>;
  registryConfig: anchor.web3.PublicKey;
  authority: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, registryConfig, authority } = params;

  return await program.methods
    .initRegistryConfigTreasury()
    .accounts({
      registryConfig,
      authority,
    })
    .instruction();
}
