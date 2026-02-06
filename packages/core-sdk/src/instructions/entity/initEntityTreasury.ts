import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Entity } from "../../types/entity";

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
  instruction: Promise<anchor.web3.TransactionInstruction>;
} {
  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initEntityTreasury([...entityId])
    .accounts({
      payer,
    })
    .instruction();

  return {
    instruction,
  };
}
