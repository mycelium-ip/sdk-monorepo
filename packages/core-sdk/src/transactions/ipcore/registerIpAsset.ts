import type { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
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
  entity: string;
  payer: string;
  authority: string;

  ipId: number;
  registrationFee: number;

  metadataUri: string;

  controllers: string[];
}): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
  const {
    program,
    metadataProgram,
    entity,
    payer,
    metadataUri,
    authority,
    ipId,
    registrationFee,
    controllers,
  } = params;

  const entityPublicKey = new PublicKey(entity);
  const entityIdUint = entityPublicKey.toBytes();
  const authorityPublicKey = new PublicKey(authority);
  const payerPublicKey = new PublicKey(payer);
  const controllersPublicKey = controllers.map((c) => new PublicKey(c));

  const [entityPda] = deriveEntityPda(entityIdUint);
  const [registryConfigPda] = deriveRegistryConfigPda();
  const [registryConfigTreasuryPda] = deriveRegistryConfigTreasuryPda();

  const registryConfigIx = await buildInitializeRegistryConfigIx({
    program: program,
    authority: authorityPublicKey,
    feeLamports: new anchor.BN(0.005 * LAMPORTS_PER_SOL),
  });

  const registryConfigTreasuryIx =
    await buildInitializeRegistryConfigTreasuryIx({
      program: program,
      registryConfig: registryConfigPda,
      authority: authorityPublicKey,
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
      payer: payerPublicKey,
      registryConfig: registryConfigPda,
      registryConfigTreasury: registryConfigTreasuryPda,
      ipId: new anchor.BN(ipId),
      registrationFeeLamports: new anchor.BN(
        registrationFee * LAMPORTS_PER_SOL,
      ),
      controllers: controllersPublicKey,
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
    creator: payerPublicKey,
    schemaUri: schemaUri,
  });

  const metadataInstruction = await buildCreateIpMetadataIx({
    program: metadataProgram,
    ipAssetPda: ipAssetPda,
    entityPda: entityPda,
    schemaPda: schemaPda,
    version: new anchor.BN(1),
    metadataUri,
    payer: payerPublicKey,
    controllers: controllersPublicKey,
  });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction({
    feePayer: payerPublicKey,
  });

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
