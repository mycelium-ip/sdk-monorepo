import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { deriveRegistryConfigPda } from "../../pda";
import {
  buildInitEntityCounterInstruction,
  buildInitializeRegistryConfigIx,
  buildInitializeRegistryConfigTreasuryIx,
  buildInitIpRegistryInstruction,
  buildRegisterSchemaIx,
} from "../../instructions";
import { Entity, Ipcore, Metadata } from "../../types";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { buildInitIpCounterInstruction } from "../../instructions/ipcore/initIpCounter";
import { entityMetadataExampleJson, ipMetadataExampleJson } from "../../helper";
import { ENTITY_SCHEMA_ID, IP_SCHEMA_ID, VERSION_1 } from "../../constants";

export type AdminTransactionParams = {
  schemaCid: string;
  entityProgram: Program<Entity>;
  metadataProgram: Program<Metadata>;
  ipcoreProgram: Program<Ipcore>;
  payer: PublicKey;
  registrationFee: number;
  schemaVersion: string;
  schemaJson: string;
  schemaId: string;
};

export async function initAdminInstructions({
  schemaCid,
  schemaId,
  schemaJson,
  schemaVersion,
  entityProgram,
  metadataProgram,
  ipcoreProgram,
  payer,
  registrationFee,
}: AdminTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  const [registryConfigPda] = deriveRegistryConfigPda();

  const entitySchemaInstruction = await buildRegisterSchemaIx({
    program: metadataProgram,
    version: VERSION_1,
    creator: payer,
    schemaCid: "bafkreigxtyoylnz6wmq2c46iik4xpzvu7ltfy2b7yqmcihugx3x2dbbtze",
    schemaJson: JSON.stringify(entityMetadataExampleJson),
    schemaId: ENTITY_SCHEMA_ID,
  });

  const ipSchemaInstruction = await buildRegisterSchemaIx({
    program: metadataProgram,
    version: VERSION_1,
    creator: payer,
    schemaCid: "bafkreieinhdchmhtiegaegvkikl6dawk6b43y2dkpif65v23gronw4lsp4",
    schemaJson: JSON.stringify(ipMetadataExampleJson),
    schemaId: IP_SCHEMA_ID,
  });

  const registryConfigIx = await buildInitializeRegistryConfigIx({
    program: ipcoreProgram,
    authority: payer,
    feeLamports: new anchor.BN(registrationFee * LAMPORTS_PER_SOL),
  });

  const registryConfigTreasuryIx =
    await buildInitializeRegistryConfigTreasuryIx({
      program: ipcoreProgram,
      registryConfig: registryConfigPda,
      authority: payer,
    });

  const entityCounterIx = await buildInitEntityCounterInstruction({
    program: entityProgram,
    payer,
  });

  const ipCounterIx = await buildInitIpCounterInstruction({
    program: ipcoreProgram,
    payer,
  });

  const { instruction: ipRegistryInstruction } =
    await buildInitIpRegistryInstruction(ipcoreProgram, payer);

  const transaction = new anchor.web3.Transaction()
    .add(entitySchemaInstruction)
    .add(ipSchemaInstruction)
    .add(registryConfigIx)
    .add(registryConfigTreasuryIx)
    .add(entityCounterIx)
    .add(ipCounterIx)
    .add(ipRegistryInstruction);

  return { transaction };
}
