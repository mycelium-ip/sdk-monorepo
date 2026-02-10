import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { deriveEntityPda } from "../../pda";
import type { Entity } from "../../types/entity";

export type BuildUpdateControllersInstructionParams = {
  program: Program<Entity>;

  // Intent
  owner: anchor.web3.PublicKey;
  newControllers: anchor.web3.PublicKey[];
  newThreshold: number;
  entityIndex: anchor.BN;

  // Existing controllers approving this change
  controllers: anchor.web3.PublicKey[];
};

export function buildUpdateControllersInstruction({
  program,
  owner,
  newControllers,
  newThreshold,
  entityIndex,
  controllers,
}: BuildUpdateControllersInstructionParams): {
  instruction: Promise<anchor.web3.TransactionInstruction>;
  entityPda: anchor.web3.PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = deriveEntityPda(owner, entityIndex);

  // ─────────────────────────────────────────────
  // 2. Remaining accounts (multisig signers)
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
