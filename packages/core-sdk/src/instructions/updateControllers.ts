import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Entity } from "../types/entity";

export type BuildUpdateControllersInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityId: Uint8Array;
  newControllers: anchor.web3.PublicKey[];
  newThreshold: number;

  // Existing controllers approving this change
  approvingControllers: anchor.web3.PublicKey[];
};

export function buildUpdateControllersInstruction({
  program,
  entityId,
  newControllers,
  newThreshold,
  approvingControllers,
}: BuildUpdateControllersInstructionParams): {
  instruction: anchor.web3.TransactionInstruction;
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
  // 2. Remaining accounts (multisig signers)
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
    .updateControllers(newControllers, newThreshold)
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
