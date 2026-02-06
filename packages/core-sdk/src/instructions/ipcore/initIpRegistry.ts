import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";

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
  const [registryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ip_registry")],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction (NO send, NO sign)
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .initIpRegistry()
    .accounts({
      registry: registryPda,
      payer,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return {
    instruction,
    registryPda,
  };
}
