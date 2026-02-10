import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types";

export type BuildInitIpCounterInstructionParams = {
  program: Program<Ipcore>;
  entityPda: anchor.web3.PublicKey;

  // Fee payer
  payer: anchor.web3.PublicKey;
};

export function buildInitIpCounterInstruction({
  program,
  entityPda,
  payer,
}: BuildInitIpCounterInstructionParams): Promise<anchor.web3.TransactionInstruction> {
  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initIpCounter()
    .accounts({
      payer,
      entity: entityPda,
    })
    .instruction();

  return instruction;
}
