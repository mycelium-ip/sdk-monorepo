import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types";

export type BuildInitIpCounterInstructionParams = {
  program: Program<Ipcore>;

  // Fee payer
  payer: anchor.web3.PublicKey;
};

export function buildInitIpCounterInstruction({
  program,
  payer,
}: BuildInitIpCounterInstructionParams): Promise<anchor.web3.TransactionInstruction> {
  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initIpCounter()
    .accounts({
      payer,
    })
    .instruction();

  return instruction;
}
