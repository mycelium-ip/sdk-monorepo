import type { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, type PublicKey, Transaction } from "@solana/web3.js";
import {
  buildCreateIpMetadataIx,
  buildInitializeRegistryConfigIx,
  buildInitializeRegistryConfigTreasuryIx,
  buildRegisterRootIpInstruction,
  buildRegisterSchemaIx,
} from "../../instructions";
import type { Ipcore } from "../../types/ipcore";
import { Metadata } from "../../types";
import {
  deriveEntityPda,
  deriveRegistryConfigPda,
  deriveRegistryConfigTreasuryPda,
  deriveSchemaPda,
} from "../../pda";
import * as anchor from "@coral-xyz/anchor";

export async function createRegisterIpAssetTransaction(params: {
  program: Program<Ipcore>;
  metadataProgram: Program<Metadata>;
  entity: Uint8Array;
  payer: PublicKey;
  authority: PublicKey;

  ipId: BN;
  registrationFeeLamports: BN;

  name: string;
  logoUrl: string;
  creatorName: string;
  country: string;
  city: string;
  ipType: string;
  description: string;
  isParticipantOfHackathon: boolean;

  controllers: PublicKey[];
}): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
  const {
    program,
    metadataProgram,
    entity,
    payer,
    authority,
    ipId,
    registrationFeeLamports,
    controllers,
    name,
    logoUrl,
    creatorName,
    country,
    city,
    ipType,
    description,
    isParticipantOfHackathon,
  } = params;
  const [entityPda] = deriveEntityPda(entity);
  const [registryConfigPda] = deriveRegistryConfigPda();
  const [registryConfigTreasuryPda] = deriveRegistryConfigTreasuryPda();

  const registryConfigIx = await buildInitializeRegistryConfigIx({
    program: program,
    authority: authority,
    feeLamports: new anchor.BN(0.005 * LAMPORTS_PER_SOL),
  });

  const registryConfigTreasuryIx =
    await buildInitializeRegistryConfigTreasuryIx({
      program: program,
      registryConfig: registryConfigPda,
      authority: authority,
    });

  const currentRegistryConfig =
    await program.account.registryConfig.fetchNullable(registryConfigPda);
  const currentRegistryConfigTreasury =
    await program.account.registryConfigTreasury.fetchNullable(
      registryConfigTreasuryPda,
    );

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const { instruction: ipAssetInstruction, ipAssetPda } =
    await buildRegisterRootIpInstruction(program, {
      entity: entityPda,
      payer,
      registryConfig: registryConfigPda,
      registryConfigTreasury: registryConfigTreasuryPda,
      ipId,
      registrationFeeLamports,
      controllers,
    });

  const schemaCategory = "1";
  const schemaVersion = new anchor.BN(1);
  const schemaUri = "https://example.com";
  const [schemaPda] = deriveSchemaPda(schemaCategory, schemaVersion);

  const currentSchema =
    await metadataProgram.account.schemaRegistry.fetchNullable(schemaPda);

  const schemaInstruction = await buildRegisterSchemaIx({
    program: metadataProgram,
    category: schemaCategory,
    version: schemaVersion,
    creator: payer,
    schemaUri: schemaUri,
  });

  const metadataInstruction = await buildCreateIpMetadataIx({
    program: metadataProgram,
    ipAssetPda: ipAssetPda,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    name,
    logoUrl,
    creatorName,
    city,
    country,
    ipType,
    description,
    isParticipantOfHackathon,
    payer,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction();

  if (!currentRegistryConfig) {
    transaction.add(registryConfigIx);
  }

  if (!currentRegistryConfigTreasury) {
    transaction.add(registryConfigTreasuryIx);
  }

  transaction.add(ipAssetInstruction);

  if (!currentSchema) {
    transaction.add(schemaInstruction);
  }

  transaction.add(metadataInstruction);

  return {
    transaction,
    ipAssetPda,
  };
}
