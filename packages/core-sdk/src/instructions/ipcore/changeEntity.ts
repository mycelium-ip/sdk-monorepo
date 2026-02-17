import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Ipcore } from "../../types/ipcore";

export async function buildChangeEntityInstruction(
  program: Program<Ipcore>,
  params: {
    previousEntity: PublicKey;
    newEntity: PublicKey;
    ipAsset: PublicKey;
    controllers: PublicKey[];
  },
): Promise<TransactionInstruction> {
  const { previousEntity, newEntity, controllers, ipAsset } = params;

  // ─────────────────────────────────────────────
  // 1. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .changeEntity()
    .accounts({
      previousEntity,
      newEntity,
      ipAsset,
    })
    .remainingAccounts(
      controllers.map((pk) => ({
        pubkey: pk,
        isSigner: true,
        isWritable: false,
      })),
    )
    .instruction();

  return instruction;
}
