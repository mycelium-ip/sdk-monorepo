import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type { Entity } from "../../types/entity";

export type BuildInitEntityTreasuryInstructionParams = {
  program: Program<Entity>;

  // Intent
  entityPda: anchor.web3.PublicKey;

  // Fee payer
  payer: anchor.web3.PublicKey;
  controllers: anchor.web3.PublicKey[];
};

export function buildInitEntityTreasuryInstruction({
  program,
  entityPda,
  payer,
  controllers,
}: BuildInitEntityTreasuryInstructionParams): {
  instruction: Promise<anchor.web3.TransactionInstruction>;
} {
  // ─────────────────────────────────────────────
  // 3. Build instruction (pure)
  // ─────────────────────────────────────────────
  const instruction = program.methods
    .initEntityTreasury()
    .accounts({
      payer,
      entity: entityPda,
    })
    .remainingAccounts(
      controllers.map((kp) => ({
        pubkey: kp,
        isSigner: true,
        isWritable: false,
      })),
    )
    .instruction();

  return {
    instruction,
  };
}
