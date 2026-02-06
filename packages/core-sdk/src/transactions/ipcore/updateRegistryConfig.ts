import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateRegistryConfigIx } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createUpdateRegistryConfigTransaction(params: {
  program: Program<Ipcore>;
  registryConfig: PublicKey;
  authority: PublicKey;
  newFeeLamports: BN;
}): Promise<{ transaction: Transaction }> {
  const { program, registryConfig, authority, newFeeLamports } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildUpdateRegistryConfigIx({
    program,
    registryConfig,
    authority,
    newFeeLamports,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
