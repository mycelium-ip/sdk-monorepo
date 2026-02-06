import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildInitIpRegistryInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createInitIpRegistryTransaction(params: {
  program: Program<Ipcore>;
  payer: PublicKey;
}): Promise<{ transaction: Transaction; registryPda: PublicKey }> {
  const { program, payer } = params;

  // ─────────────────────────────────────────────
  // 1. Build instruction
  // ─────────────────────────────────────────────
  const { instruction, registryPda } = await buildInitIpRegistryInstruction(
    program,
    payer,
  );

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return {
    transaction,
    registryPda,
  };
}
