import * as anchor from "@coral-xyz/anchor";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";
import { buildInitializeRegistryConfigTreasuryIx } from "../../instructions";

export async function createInitializeRegistryConfigTreasuryTransaction(params: {
  program: Program<Ipcore>;
  registryConfigTreasury: PublicKey;
  registryConfig: PublicKey;
  authority: PublicKey;
}): Promise<{ transaction: Transaction; registryConfigTreasury: PublicKey }> {
  const { program, registryConfigTreasury, registryConfig, authority } = params;

  // ─────────────────────────────────────────────
  // 1. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await buildInitializeRegistryConfigTreasuryIx({
    program,
    registryConfigTreasury,
    registryConfig,
    authority,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction, registryConfigTreasury };
}
