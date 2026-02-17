import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildChangeEntityInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createChangeEntityTransaction(params: {
  program: Program<Ipcore>;
  previousEntity: PublicKey;
  newEntity: PublicKey;
  ipAsset: PublicKey;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const { program, previousEntity, newEntity, ipAsset, controllers } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────

  const changeEntityInstruction = await buildChangeEntityInstruction(program, {
    previousEntity,
    newEntity,
    ipAsset,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────

  const transaction = new Transaction();

  transaction.add(changeEntityInstruction);

  return { transaction };
}
