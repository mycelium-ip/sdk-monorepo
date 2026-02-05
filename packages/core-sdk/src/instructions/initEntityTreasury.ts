import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../types/entity";

export type BuildInitEntityTreasuryInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityId: Uint8Array;

  // Fee payer
  payer: anchor.web3.PublicKey;
};

export function buildInitEntityTreasuryInstruction({
  program,
  entityId,
  payer,
}: BuildInitEntityTreasuryInstructionParams): {
  instruction: anchor.web3.TransactionInstruction;
  entityPda: anchor.web3.PublicKey;
  treasuryPda: anchor.web3.PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("entity"), Buffer.from(entityId)],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Derive Treasury PDA
  // ─────────────────────────────────────────────
  const [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("entity_treasury"), entityPda.toBuffer()],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initEntityTreasury([...entityId])
    .accounts({
      entity: entityPda,
      treasury: treasuryPda,
      payer,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();

  return {
    instruction,
    entityPda,
    treasuryPda,
  };
}
