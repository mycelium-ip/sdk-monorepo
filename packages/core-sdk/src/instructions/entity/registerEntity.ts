import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";

export type BuildRegisterEntityInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityId: Uint8Array;
  controllers: anchor.web3.PublicKey[];
  threshold: number;

  // Who pays for account creation
  payer: anchor.web3.PublicKey;
};

export function buildRegisterEntityInstruction({
  program,
  entityId,
  controllers,
  threshold,
  payer,
}: BuildRegisterEntityInstructionParams): {
  instruction: Promise<anchor.web3.TransactionInstruction>;
} {
  // ─────────────────────────────────────────────
  // 2. Build instruction (NO send, NO sign)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .registerEntity([...entityId], controllers, threshold)
    .accounts({
      payer,
    })
    .instruction();

  return {
    instruction,
  };
}
