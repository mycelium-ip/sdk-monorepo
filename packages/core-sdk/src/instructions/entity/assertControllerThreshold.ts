import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../../types/entity";
import { deriveEntityPda } from "../../pda";

export type BuildAssertControllerThresholdInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityId: Uint8Array;

  // Controllers asserting the threshold
  approvingControllers: anchor.web3.PublicKey[];
};

export function buildAssertControllerThresholdInstruction({
  program,
  entityId,
  approvingControllers,
}: BuildAssertControllerThresholdInstructionParams): {
  instruction: Promise<anchor.web3.TransactionInstruction>;
  entityPda: anchor.web3.PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = deriveEntityPda(entityId);

  // ─────────────────────────────────────────────
  // 2. Remaining accounts (controller signers)
  // ─────────────────────────────────────────────
  const remainingAccounts = approvingControllers.map((pk) => ({
    pubkey: pk,
    isSigner: true,
    isWritable: false,
  }));

  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .assertControllerThreshold()
    .accounts({
      entity: entityPda,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  return {
    instruction,
    entityPda,
  };
}
