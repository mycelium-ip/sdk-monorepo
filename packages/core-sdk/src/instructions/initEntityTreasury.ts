// src/instructions/initEntityTreasury.ts
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { anchorDiscriminator } from "../core/encoding";

export type BuildInitEntityTreasuryInstructionParams = {
  programId: PublicKey;

  entityId: Uint8Array; // 32 bytes
  payer: PublicKey;
};

export function buildInitEntityTreasuryInstruction({
  programId,
  entityId,
  payer,
}: BuildInitEntityTreasuryInstructionParams): {
  instruction: TransactionInstruction;
  entityPda: PublicKey;
  treasuryPda: PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive Entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("entity"), Buffer.from(entityId)],
    programId,
  );

  // ─────────────────────────────────────────────
  // 2. Derive Treasury PDA
  // ─────────────────────────────────────────────
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("entity_treasury"), entityPda.toBuffer()],
    programId,
  );

  // ─────────────────────────────────────────────
  // 3. Instruction data (discriminator only)
  // ─────────────────────────────────────────────
  const data = anchorDiscriminator("init_entity_treasury");

  // ─────────────────────────────────────────────
  // 4. Accounts required by the program
  // ─────────────────────────────────────────────
  const keys = [
    { pubkey: entityPda, isSigner: false, isWritable: true },
    { pubkey: treasuryPda, isSigner: false, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  // ─────────────────────────────────────────────
  // 5. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = new TransactionInstruction({
    programId,
    keys,
    data,
  });

  return { instruction, entityPda, treasuryPda };
}
