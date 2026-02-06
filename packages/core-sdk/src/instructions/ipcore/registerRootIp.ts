import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";

export type RegisterRootIpIx = {
  instruction: TransactionInstruction;
  ipAssetPda: PublicKey;
};

export async function buildRegisterRootIpInstruction(
  program: Program<Ipcore>,
  params: {
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
  },
): Promise<RegisterRootIpIx> {
  const {
    entity,
    entityProgram,
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
  // 1. Derive IPAsset PDA
  // ─────────────────────────────────────────────
  const [ipAssetPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("ip_asset"),
      entity.toBuffer(),
      ipId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .registerRootIp(
      ipId,
      category,
      metadataUri,
      provenance,
      registrationFeeLamports,
    )
    .accounts({
      entity,
      ipAsset: ipAssetPda,
      payer,
      systemProgram: SystemProgram.programId,
      entityProgram,
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
