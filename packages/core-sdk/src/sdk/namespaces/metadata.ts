import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import type { ProgramIds } from "../../programs/programIds";
import type { Metadata } from "../../types/metadata";
import { BN } from "@coral-xyz/anchor";
import {
  createEntityMetadataTransaction,
  createIpMetadataTransaction,
  createLockEntityMetadataTransaction,
  createLockIpMetadataTransaction,
  createRegisterSchemaTransaction,
  createUpdateEntityMetadataTransaction,
  createUpdateIpMetadataTransaction,
} from "../../transactions/metadata";

export class MetadataNamespace {
  private readonly programIds: ProgramIds;

  constructor(programIds: ProgramIds) {
    this.programIds = programIds;
  }

  async generateCreateEntityMetadataTransaction(params: {
    program: Program<Metadata>;
    entityPda: PublicKey;
    schemaPda: PublicKey;
    version: BN;
    metadataCid: string;
    payer: PublicKey;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createEntityMetadataTransaction(params);
  }

  async generateCreateIpMetadataTransaction(params: {
    program: Program<Metadata>;
    ipAssetPda: PublicKey;
    schemaPda: PublicKey;
    entityPda: PublicKey;
    version: BN;
    metadataCid: string;
    payer: PublicKey;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createIpMetadataTransaction(params);
  }

  async generateLockEntityMetadataTransaction(params: {
    program: Program<Metadata>;
    metadataPda: PublicKey;
    entityPda: PublicKey;
    authority: PublicKey;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createLockEntityMetadataTransaction(params);
  }

  async generateLockIpMetadataTransaction(params: {
    program: Program<Metadata>;
    metadataPda: PublicKey;
    ipAssetPda: PublicKey;
    entityPda: PublicKey;
    authority: PublicKey;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createLockIpMetadataTransaction(params);
  }

  async generateRegisterSchemaTransaction(params: {
    program: Program<Metadata>;
    schemaCid: string;
    version: string;
    schemaJson: string;
    schemaId: string;
    creator: PublicKey;
  }): Promise<{ transaction: Transaction }> {
    return createRegisterSchemaTransaction(params);
  }

  async generateUpdateEntityMetadataTransaction(params: {
    program: Program<Metadata>;
    entityPda: PublicKey;
    previousMetadataPda: PublicKey;
    payer: PublicKey;
    metadataCid: string;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createUpdateEntityMetadataTransaction(params);
  }

  async generateUpdateIpMetadataTransaction(params: {
    program: Program<Metadata>;
    ipAssetPda: PublicKey;
    entityPda: PublicKey;
    previousMetadataPda: PublicKey;
    payer: PublicKey;
    metadataCid: string;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction }> {
    return createUpdateIpMetadataTransaction(params);
  }
}
