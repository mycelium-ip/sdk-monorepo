import type { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, type PublicKey, Transaction } from "@solana/web3.js";
import {
  buildCreateIpMetadataIx,
  buildRegisterRootIpInstruction,
} from "../../instructions";
import type { Ipcore } from "../../types/ipcore";
import { Metadata } from "../../types";
import {
  deriveIPAssetPda,
  deriveIpCounterPda,
  deriveRegistryConfigPda,
  deriveRegistryConfigTreasuryPda,
  deriveSchemaPda,
} from "../../pda";
import * as anchor from "@coral-xyz/anchor";
import { IP_SCHEMA_ID, VERSION_1 } from "../../constants";

export async function createRegisterIpAssetTransaction(params: {
  program: Program<Ipcore>;
  metadataProgram: Program<Metadata>;
  payer: PublicKey;
  entityPda: PublicKey;

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
    entityPda,
  } = params;
  let currentIpCounterIndex = new anchor.BN(0);

  const [ipCounterPda] = deriveIpCounterPda();

  const [registryConfigPda] = deriveRegistryConfigPda();
  const [registryConfigTreasuryPda] = deriveRegistryConfigTreasuryPda();

  const currentIpCounter =
    await program.account.ipCounter.fetchNullable(ipCounterPda);

  if (currentIpCounter) {
    currentIpCounterIndex = currentIpCounter.nextIpIndex;
  }

  const [ipAssetPda] = deriveIPAssetPda(payer, currentIpCounterIndex);

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

  const schemaId = IP_SCHEMA_ID;
  const schemaVersion = VERSION_1;

  const [schemaPda] = deriveSchemaPda(schemaId, schemaVersion);

  const currentSchema =
    await metadataProgram.account.schemaRegistry.fetchNullable(schemaPda);

  if (!currentSchema) {
    throw new Error(
      `Schema not registered: version=${schemaVersion.toString()}`,
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
