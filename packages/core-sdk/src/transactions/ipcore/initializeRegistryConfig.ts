import * as anchor from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";
import { buildInitializeRegistryConfigIx } from "../../instructions";

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
