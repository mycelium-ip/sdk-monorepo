import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Entity } from "../../types/entity";

export type BuildInitEntityCounterInstructionParams = {
  program: Program<Entity>;

  // Fee payer
  payer: anchor.web3.PublicKey;
};

export function buildInitEntityCounterInstruction({
  program,
  payer,
}: BuildInitEntityCounterInstructionParams): Promise<anchor.web3.TransactionInstruction> {
  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initEntityCounter()
    .accounts({
      payer,
    })
    .instruction();

  return instruction;
}
