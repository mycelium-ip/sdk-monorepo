import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildRegisterRootIpInstruction } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createRegisterIpAssetTransaction(params: {
  program: Program<Ipcore>;
  entity: PublicKey;
  entityProgram: PublicKey;
  payer: PublicKey;

  registryConfig: PublicKey;
  registryConfigTreasury: PublicKey;

  ipId: BN;
  registrationFeeLamports: BN;

  controllers: PublicKey[];
}): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
  const {
    program,
    entity,
    payer,
    registryConfig,
    registryConfigTreasury,
    ipId,
    registrationFeeLamports,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const { instruction, ipAssetPda } = await buildRegisterRootIpInstruction(
    program,
    {
      entity,
      payer,
      registryConfig,
      registryConfigTreasury,
      ipId,
      registrationFeeLamports,
      controllers,
    },
  );

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return {
    transaction,
    ipAssetPda,
  };
}
