import type { BN, Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Ipcore } from "../../types/ipcore";

export type RegisterRootIpIx = {
  instruction: TransactionInstruction;
};

export async function buildRegisterRootIpInstruction(
  program: Program<Ipcore>,
  params: {
    entity: PublicKey;
    payer: PublicKey;

    registryConfig: PublicKey;
    registryConfigTreasury: PublicKey;

    ipCounterPda: PublicKey;
    registrationFeeLamports: BN;

    controllers: PublicKey[];
  },
): Promise<TransactionInstruction> {
  const {
    entity,
    payer,
    registryConfig,
    registryConfigTreasury,
    ipCounterPda,
    registrationFeeLamports,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .registerIpAsset(registrationFeeLamports)
    .accounts({
      entity,
      payer,
      registryConfig,
      registryConfigTreasury,
      ipCounter: ipCounterPda,
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
