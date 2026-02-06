import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

export async function buildInitModuleConfigInstruction(params: {
  program: Program<Ipcore>;
  ipAsset: anchor.web3.PublicKey;
  payer: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, ipAsset, payer } = params;

  const [moduleConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("module_config"), ipAsset.toBuffer()],
    program.programId,
  );

  return await program.methods
    .initModuleConfig()
    .accounts({
      moduleConfig: moduleConfigPda,
      ipAsset,
      payer,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
