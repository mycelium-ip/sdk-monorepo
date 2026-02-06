import { Transaction, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";
import { buildInitIpRegistryInstruction } from "../../instructions";

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
