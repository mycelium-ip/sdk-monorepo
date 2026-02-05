// src/instructions/updateControllers.ts
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { anchorDiscriminator } from "../core/encoding";
import { encodePubkeyVec, encodeU8 } from "../core/borsh";

export type BuildUpdateControllersInstructionParams = {
  programId: PublicKey;

  entityId: Uint8Array;

  newControllers: PublicKey[];
  newThreshold: number;

  // existing controllers approving the rotation
  approvingControllers: PublicKey[];
};

export function buildUpdateControllersInstruction({
  programId,
  entityId,
  newControllers,
  newThreshold,
  approvingControllers,
}: BuildUpdateControllersInstructionParams): {
  instruction: TransactionInstruction;
  entityPda: PublicKey;
} {
  // ─────────────────────────────────────────────
  // 1. Derive entity PDA
  // ─────────────────────────────────────────────
  const [entityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("entity"), Buffer.from(entityId)],
    programId,
  );

  // ─────────────────────────────────────────────
  // 2. Encode instruction data
  // ─────────────────────────────────────────────
  const data = Buffer.concat([
    anchorDiscriminator("update_controllers"), // 8 bytes
    encodePubkeyVec(newControllers), // Vec<Pubkey>
    encodeU8(newThreshold), // u8
  ]);

  // ─────────────────────────────────────────────
  // 3. Remaining accounts = approving controllers
  // ─────────────────────────────────────────────
  const keys = [
    { pubkey: entityPda, isSigner: false, isWritable: true },
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

  return { instruction, entityPda };
}
