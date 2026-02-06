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
  entityPda: anchor.web3.PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("entity"), Buffer.from(entityId)],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction (NO send, NO sign)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .registerEntity([...entityId], controllers, threshold)
    .accounts({
      entity: entityPda,
      payer,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();

  return {
    instruction,
    entityPda,
  };
}
