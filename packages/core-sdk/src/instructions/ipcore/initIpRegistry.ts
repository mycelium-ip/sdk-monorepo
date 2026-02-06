import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { deriveIPRegistryPda } from "../../pda";
import type { Ipcore } from "../../types/ipcore";

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
