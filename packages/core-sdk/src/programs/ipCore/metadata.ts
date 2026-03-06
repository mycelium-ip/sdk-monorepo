import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import {
  deriveEntityMetadataPda,
  deriveIpMetadataPda,
  deriveMetadataSchemaPda,
} from "../../pda/metadata";
import type {
  CreateEntityMetadataParams,
  CreateIpMetadataParams,
  CreateMetadataSchemaParams,
  SendTxOptions,
} from "../../types";
import { sha256Hash, toFixedBytes, toU64Bn } from "../../utils/conversions";
import { sendInstruction } from "../../utils/transactions";
import type { IpCoreClient } from "./IpCoreClient";

export class MetadataModule {
  constructor(private readonly client: IpCoreClient) {}

  async createSchemaIx(
    params: CreateMetadataSchemaParams,
  ): Promise<TransactionInstruction> {
    const creator = this.resolveWalletPubkey(params.creator);
    const [metadataSchema] = deriveMetadataSchemaPda(
      params.id,
      params.version,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createMetadataSchema(
        toFixedBytes(params.id, 32, "id"),
        toFixedBytes(params.version, 16, "version"),
        toFixedBytes(sha256Hash(params.data), 32, "hash"),
        toFixedBytes(params.cid, 96, "cid"),
      )
      .accounts({
        metadataSchema,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async createSchema(
    params: CreateMetadataSchemaParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.createSchemaIx(params);
    return sendInstruction(
      this.client.provider,
      instruction,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async createEntityMetadataIx(
    params: CreateEntityMetadataParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const [metadata] = deriveEntityMetadataPda(
      params.entity,
      params.revision,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createEntityMetadata(
        toU64Bn(params.revision, "revision"),
        toFixedBytes(sha256Hash(params.data), 32, "hash"),
        toFixedBytes(params.cid, 96, "cid"),
      )
      .accounts({
        metadata,
        entity: params.entity,
        schema: params.schema,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async createEntityMetadata(
    params: CreateEntityMetadataParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.createEntityMetadataIx(params);
    return sendInstruction(
      this.client.provider,
      instruction,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async createIpMetadataIx(
    params: CreateIpMetadataParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const [metadata] = deriveIpMetadataPda(
      params.ip,
      params.revision,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createIpMetadata(
        toU64Bn(params.revision, "revision"),
        toFixedBytes(sha256Hash(params.data), 32, "hash"),
        toFixedBytes(params.cid, 96, "cid"),
      )
      .accounts({
        metadata,
        ip: params.ip,
        ownerEntity: params.ownerEntity,
        schema: params.schema,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async createIpMetadata(
    params: CreateIpMetadataParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.createIpMetadataIx(params);
    return sendInstruction(
      this.client.provider,
      instruction,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  private resolveWalletPubkey(value?: PublicKey): PublicKey {
    const walletPubkey = value ?? this.client.provider.wallet.publicKey;
    if (!walletPubkey) {
      throw new Error("Wallet publicKey is required");
    }

    return walletPubkey;
  }
}
