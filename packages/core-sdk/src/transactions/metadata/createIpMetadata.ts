import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildCreateIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  schemaPda: PublicKey;
  entityPda: PublicKey;
  version: BN;
  logoUrl: string;
  name: string;
  creatorName: string;
  country: string;
  city: string;
  ipType: string;
  description: string;
  isParticipantOfHackathon: boolean;
  payer: PublicKey;
  controllers: PublicKey[];
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    schemaPda,
    entityPda,
    version,
    logoUrl,
    name,
    creatorName,
    country,
    city,
    ipType,
    description,
    isParticipantOfHackathon,
    payer,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildCreateIpMetadataIx({
    program,
    ipAssetPda,
    entityPda,
    schemaPda,
    version,
    logoUrl,
    name,
    creatorName,
    country,
    city,
    ipType,
    description,
    isParticipantOfHackathon,
    payer,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create the transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
