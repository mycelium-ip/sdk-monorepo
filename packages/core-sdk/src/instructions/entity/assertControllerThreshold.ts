import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { deriveEntityPda } from "../../pda";
import type { Entity } from "../../types/entity";

export type BuildAssertControllerThresholdInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityId: Uint8Array;

  // Controllers asserting the threshold
  controllers: anchor.web3.PublicKey[];
};

export function buildAssertControllerThresholdInstruction({
  program,
  entityId,
  controllers,
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
  const remainingAccounts = controllers.map((pk) => ({
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
