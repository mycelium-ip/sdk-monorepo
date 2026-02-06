import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";

export type RegisterDerivativeIpIx = {
  instruction: TransactionInstruction;
  ipAssetPda: PublicKey;
};

export async function buildRegisterDerivativeIpInstruction(
  program: Program<Ipcore>,
  params: {
    entity: PublicKey;
    entityProgram: PublicKey;
    payer: PublicKey;

    ipId: BN;
    name: string;
    category: number;
    parentRefs: BN[];

    controllers: PublicKey[];
  },
): Promise<RegisterDerivativeIpIx> {
  const {
    entity,
    entityProgram,
    payer,
    ipId,
    name,
    category,
    parentRefs,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Derive IPAsset PDA
  // ─────────────────────────────────────────────
  const [ipAssetPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("ip_asset"),
      entity.toBuffer(),
      Buffer.from(ipId.toArray("le", 8)),
    ],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .registerDerivativeIp(ipId, name, category, parentRefs)
    .accounts({
      entity,
      ipAsset: ipAssetPda,
      payer,
      systemProgram: SystemProgram.programId,
      entityProgram,
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
