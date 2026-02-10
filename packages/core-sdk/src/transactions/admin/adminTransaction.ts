import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { deriveRegistryConfigPda } from "../../pda";
import {
  buildInitEntityCounterInstruction,
  buildInitializeRegistryConfigIx,
  buildInitializeRegistryConfigTreasuryIx,
  buildRegisterSchemaIx,
} from "../../instructions";
import { Entity, Ipcore, Metadata } from "../../types";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { buildInitIpCounterInstruction } from "../../instructions/ipcore/initIpCounter";

export type AdminTransactionParams = {
  schemaUri: string;
  entityProgram: Program<Entity>;
  metadataProgram: Program<Metadata>;
  ipcoreProgram: Program<Ipcore>;
  payer: PublicKey;
  authority: PublicKey;
  registrationFee: number;
};

export async function initAdminInstructions({
  schemaUri,
  entityProgram,
  metadataProgram,
  ipcoreProgram,
  payer,
  authority,
  registrationFee,
}: AdminTransactionParams): Promise<{
  transaction: anchor.web3.Transaction;
}> {
  const [registryConfigPda] = deriveRegistryConfigPda();
  const schemaCategory = "1";
  const schemaVersion = new anchor.BN(1);

  const schemaInstruction = await buildRegisterSchemaIx({
    program: metadataProgram,
    category: schemaCategory,
    version: schemaVersion,
    creator: payer,
    schemaUri: schemaUri,
  });

  const registryConfigIx = await buildInitializeRegistryConfigIx({
    program: ipcoreProgram,
    authority: authority,
    feeLamports: new anchor.BN(registrationFee * LAMPORTS_PER_SOL),
  });

  const registryConfigTreasuryIx =
    await buildInitializeRegistryConfigTreasuryIx({
      program: ipcoreProgram,
      registryConfig: registryConfigPda,
      authority: authority,
    });

  const entityCounterIx = await buildInitEntityCounterInstruction({
    program: entityProgram,
    payer,
  });

  const ipCounterIx = await buildInitIpCounterInstruction({
    program: ipcoreProgram,
    payer,
  });

  const transaction = new anchor.web3.Transaction()
    .add(schemaInstruction)
    .add(registryConfigIx)
    .add(registryConfigTreasuryIx)
    .add(entityCounterIx)
    .add(ipCounterIx);

  return { transaction };
}
