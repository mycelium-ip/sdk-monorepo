import type { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, type PublicKey, Transaction } from "@solana/web3.js";
import {
  buildCreateIpMetadataIx,
  buildRegisterRootIpInstruction,
} from "../../instructions";
import type { Ipcore } from "../../types/ipcore";
import { Metadata } from "../../types";
import {
  deriveEntityPda,
  deriveIPAssetPda,
  deriveIpCounterPda,
  deriveRegistryConfigPda,
  deriveRegistryConfigTreasuryPda,
  deriveSchemaPda,
} from "../../pda";
import * as anchor from "@coral-xyz/anchor";

export async function createRegisterIpAssetTransaction(params: {
  program: Program<Ipcore>;
  metadataProgram: Program<Metadata>;
  payer: PublicKey;
  entityIndex: number;

  registrationFee: number;

  metadataUri: string;

  controllers: PublicKey[];
}): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
  const {
    program,
    metadataProgram,
    payer,
    metadataUri,
    registrationFee,
    controllers,
    entityIndex,
  } = params;
  let currentIpCounterIndex = new anchor.BN(0);

  const entityIndexBN = new anchor.BN(entityIndex);

  const [entityPda] = deriveEntityPda(payer, entityIndexBN);

  const [ipCounterPda] = deriveIpCounterPda();

  const [registryConfigPda] = deriveRegistryConfigPda();
  const [registryConfigTreasuryPda] = deriveRegistryConfigTreasuryPda();

  const currentIpCounter =
    await program.account.ipCounter.fetchNullable(ipCounterPda);

  if (currentIpCounter) {
    currentIpCounterIndex = currentIpCounter.nextIpIndex;
  }

  const [ipAssetPda] = deriveIPAssetPda(entityPda, currentIpCounterIndex);

  const currentRegistryConfig =
    await program.account.registryConfig.fetchNullable(registryConfigPda);

  const currentRegistryConfigTreasury =
    await program.account.registryConfigTreasury.fetchNullable(
      registryConfigTreasuryPda,
    );

  if (!currentRegistryConfig) {
    throw new Error("Registry config not initialized.");
  }

  if (!currentRegistryConfigTreasury) {
    throw new Error("Registry config treasury not initialized.");
  }

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const ipAssetInstruction = await buildRegisterRootIpInstruction(program, {
    entity: entityPda,
    payer,
    registryConfig: registryConfigPda,
    registryConfigTreasury: registryConfigTreasuryPda,
    registrationFeeLamports: new anchor.BN(registrationFee * LAMPORTS_PER_SOL),
    controllers,
  });

  const schemaCategory = "1";
  const schemaVersion = new anchor.BN(1);
  const [schemaPda] = deriveSchemaPda(schemaCategory, schemaVersion);

  const currentSchema =
    await metadataProgram.account.schemaRegistry.fetchNullable(schemaPda);

  if (!currentSchema) {
    throw new Error(
      `Schema not registered: category=${schemaCategory}, version=${schemaVersion.toString()}`,
    );
  }

  const metadataInstruction = await buildCreateIpMetadataIx({
    program: metadataProgram,
    ipAssetPda: ipAssetPda,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    metadataUri,
    payer,
    controllers,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction();

  transaction.add(ipAssetInstruction);

  transaction.add(metadataInstruction);

  return {
    transaction,
    ipAssetPda,
  };
}
