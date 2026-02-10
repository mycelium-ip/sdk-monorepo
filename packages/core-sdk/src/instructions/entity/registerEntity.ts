import * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Entity } from "../../types/entity";

export type BuildRegisterEntityInstructionParams = {
  program: Program<Entity>;

  // Intent
  controllers: anchor.web3.PublicKey[];
  threshold: number;

  // Who pays for account creation
  payer: anchor.web3.PublicKey;
};

export function buildRegisterEntityInstruction({
  program,
  controllers,
  threshold,
  payer,
}: BuildRegisterEntityInstructionParams): Promise<anchor.web3.TransactionInstruction> {
  // ─────────────────────────────────────────────
  // 2. Build instruction (NO send, NO sign)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .registerEntity(controllers, threshold)
    .accounts({
      payer,
    })
    .instruction();

  return instruction;
}
