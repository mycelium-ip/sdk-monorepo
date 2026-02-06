import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildRegisterRootIpInstruction } from "../../instructions";

export async function createRegisterIpAssetTransaction(params: {
  program: Program<Ipcore>;
  entity: PublicKey;
  entityProgram: PublicKey;
  payer: PublicKey;

  registryConfig: PublicKey;
  registryConfigTreasury: PublicKey;

  ipId: BN;
  category: number;
  metadataUri: string;
  provenance: string;
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
    category,
    metadataUri,
    provenance,
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
      category,
      metadataUri,
      provenance,
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
