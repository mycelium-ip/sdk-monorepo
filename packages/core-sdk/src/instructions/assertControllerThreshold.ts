import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { anchorDiscriminator } from "../core/encoding";

export type BuildAssertControllerThresholdInstructionParams = {
  programId: PublicKey;

  entityId: Uint8Array;

  // controllers asserting quorum
  approvingControllers: PublicKey[];

  payer: PublicKey;
};

export function buildAssertControllerThresholdInstruction({
  programId,
  entityId,
  approvingControllers,
  payer,
}: BuildAssertControllerThresholdInstructionParams): {
  instruction: TransactionInstruction;
  entityPda: PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("entity"), Buffer.from(entityId)],
    programId,
  );

  // ─────────────────────────────────────────────
  // 2. Instruction data (discriminator only)
  // ─────────────────────────────────────────────
  const data = anchorDiscriminator("assert_controller_threshold");

  // ─────────────────────────────────────────────
  // 3. Account metas
  // ─────────────────────────────────────────────
  const keys = [
    { pubkey: entityPda, isSigner: false, isWritable: false },
    { pubkey: payer, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },

    // remaining accounts = controller signers
    ...approvingControllers.map((pk) => ({
      pubkey: pk,
      isSigner: true,
      isWritable: false,
    })),
  ];

  // ─────────────────────────────────────────────
  // 4. Build instruction
  // ─────────────────────────────────────────────
  const instruction = new TransactionInstruction({
    programId,
    keys,
    data,
  });

  return {
    instruction,
    entityPda,
  };
}
