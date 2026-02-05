import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { anchorDiscriminator } from "../core/encoding";
import { encodePubkeyVec, encodeU8 } from "../core/borsh";

export type BuildRegisterEntityInstructionParams = {
  programId: PublicKey;

  // intent
  entityId: Uint8Array; // 32 bytes
  controllers: PublicKey[];
  threshold: number;

  // fee payer
  payer: PublicKey;
};

export function buildRegisterEntityInstruction({
  programId,
  entityId,
  controllers,
  threshold,
  payer,
}: BuildRegisterEntityInstructionParams): {
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
  // 2. Encode instruction data
  // ─────────────────────────────────────────────
  const data = Buffer.concat([
    anchorDiscriminator("register_entity"),
    Buffer.from(entityId),
    encodePubkeyVec(controllers),
    encodeU8(threshold),
  ]);

  // ─────────────────────────────────────────────
  // 3. Account metas
  // ─────────────────────────────────────────────
  const keys = [
    { pubkey: entityPda, isSigner: false, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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
