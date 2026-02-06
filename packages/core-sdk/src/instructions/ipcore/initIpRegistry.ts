import { Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { deriveIPRegistryPda } from "../../pda";

export type InitIpRegistryIx = {
  instruction: TransactionInstruction;
  registryPda: PublicKey;
};

export async function buildInitIpRegistryInstruction(
  program: Program<Ipcore>,
  payer: PublicKey,
): Promise<InitIpRegistryIx> {
  // ─────────────────────────────────────────────
  // 1. Derive Registry PDA
  // ─────────────────────────────────────────────
  const [registryPda] = deriveIPRegistryPda();

  // ─────────────────────────────────────────────
  // 2. Build instruction (NO send, NO sign)
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .initIpRegistry()
    .accounts({
      payer,
    })
    .instruction();

  return {
    instruction,
    registryPda,
  };
}
