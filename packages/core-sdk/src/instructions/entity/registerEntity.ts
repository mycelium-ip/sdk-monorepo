import * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Entity } from "../../types/entity";
import { deriveEntityPda } from "../../pda";

export type BuildRegisterEntityInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityCounterPda: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
  threshold: number;

  // Who pays for account creation
  payer: anchor.web3.PublicKey;
};

export function buildRegisterEntityInstruction({
  program,
  entityCounterPda,
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
      entityCounter: entityCounterPda,
    })
    .instruction();

  return instruction;
}
