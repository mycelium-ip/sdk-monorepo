import type { BN, Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { deriveIPAssetPda } from "../../pda";
import type { Ipcore } from "../../types/ipcore";

export type RegisterRootIpIx = {
  instruction: TransactionInstruction;
  ipAssetPda: PublicKey;
};

export async function buildRegisterRootIpInstruction(
  program: Program<Ipcore>,
  params: {
    entity: PublicKey;
    payer: PublicKey;

    registryConfig: PublicKey;
    registryConfigTreasury: PublicKey;

    ipId: BN;
    registrationFeeLamports: BN;

    controllers: PublicKey[];
  },
): Promise<RegisterRootIpIx> {
  const {
    entity,
    payer,
    registryConfig,
    registryConfigTreasury,
    ipId,
    registrationFeeLamports,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Derive IPAsset PDA
  // ─────────────────────────────────────────────
  const [ipAssetPda] = deriveIPAssetPda(entity, ipId);

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .registerIpAsset(ipId, registrationFeeLamports)
    .accounts({
      entity,
      payer,
      registryConfig,
      registryConfigTreasury,
    })
    .remainingAccounts(
      controllers.map((pk) => ({
        pubkey: pk,
        isSigner: true,
        isWritable: false,
      })),
    )
    .instruction();

  return {
    instruction,
    ipAssetPda,
  };
}
