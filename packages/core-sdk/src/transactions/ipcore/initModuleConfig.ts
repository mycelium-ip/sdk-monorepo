import * as anchor from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";
import { buildInitModuleConfigInstruction } from "../../instructions";

export async function createInitModuleConfigTransaction(params: {
  program: Program<Ipcore>;
  ipAsset: PublicKey;
  payer: PublicKey;
}): Promise<{ transaction: Transaction; moduleConfigPda: PublicKey }> {
  const { program, ipAsset, payer } = params;

  // ─────────────────────────────────────────────
  // 1. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await buildInitModuleConfigInstruction({
    program,
    ipAsset,
    payer,
  });

  // ─────────────────────────────────────────────
  // 2. Derive ModuleConfig PDA (needed for reference)
  // ─────────────────────────────────────────────
  const [moduleConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("module_config"), ipAsset.toBuffer()],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 3. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return {
    transaction,
    moduleConfigPda,
  };
}
