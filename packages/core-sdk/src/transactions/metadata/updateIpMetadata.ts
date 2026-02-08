import type { BN, Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import { buildUpdateIpMetadataIx } from "../../instructions";
import type { Metadata } from "../../types/metadata";

export async function createUpdateIpMetadataTransaction(params: {
  program: Program<Metadata>;
  ipAssetPda: PublicKey;
  entityPda: PublicKey;
  previousMetadataPda: PublicKey;
  newMetadataPda: PublicKey;
  schemaPda: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  version: BN;
  logoUrl: string;
  name: string;
  creatorName: string;
  country: string;
  city: string;
  ipType: string;
  description: string;
  isParticipantOfHackathon: boolean;
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    logoUrl,
    name,
    creatorName,
    country,
    city,
    ipType,
    description,
    isParticipantOfHackathon,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildUpdateIpMetadataIx({
    program,
    ipAssetPda,
    entityPda,
    previousMetadataPda,
    schemaPda,
    authority,
    payer,
    version,
    logoUrl,
    name,
    creatorName,
    country,
    city,
    ipType,
    description,
    isParticipantOfHackathon,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
