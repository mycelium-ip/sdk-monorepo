import type * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildInitializeRegistryConfigIx } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createInitializeRegistryConfigTransaction(params: {
  program: Program<Ipcore>;
  authority: PublicKey;
  feeLamports: anchor.BN;
}): Promise<{ transaction: Transaction }> {
  const { program, authority, feeLamports } = params;

  // ─────────────────────────────────────────────
  // 1. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await buildInitializeRegistryConfigIx({
    program,
    authority,
    feeLamports,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
