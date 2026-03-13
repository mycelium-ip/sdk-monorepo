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
  EntityMetadataCreated,
  IpMetadataCreated,
  MetadataSchemaCreated,
  SendTxOptions,
  TransactionResult,
} from "../../types";
import { toFixedBytes } from "../../utils/bytes";
import { buildSignerMetas } from "../../utils/accounts";
import { sendInstruction } from "../../utils/transactions";
import { validateEntityAuthority } from "../../utils/validation";
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
        toFixedBytes(params.dataHash, 32, "dataHash"),
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
  ): Promise<TransactionResult<MetadataSchemaCreated>> {
    const instruction = await this.createSchemaIx(params);
    return sendInstruction<MetadataSchemaCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async createEntityMetadataIx(
    params: CreateEntityMetadataParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);

    // Fetch the entity account to determine the next revision.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityAccount = await (
      this.client.program.account as any
    ).entity.fetch(params.entity);
    const nextRevision =
      BigInt(
        (entityAccount.currentMetadataRevision as bigint | number).toString(),
      ) + BigInt(1);

    const [metadata] = deriveEntityMetadataPda(
      params.entity,
      nextRevision,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createEntityMetadata(
        toFixedBytes(params.dataHash, 32, "dataHash"),
        toFixedBytes(params.cid, 96, "cid"),
      )
      .accounts({
        metadata,
        entity: params.entity,
        schema: params.schema,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  async createEntityMetadata(
    params: CreateEntityMetadataParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<EntityMetadataCreated>> {
    await validateEntityAuthority(
      this.client,
      params.entity,
      params.controllerSigners,
    );
    const instruction = await this.createEntityMetadataIx(params);
    return sendInstruction<EntityMetadataCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async createIpMetadataIx(
    params: CreateIpMetadataParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);

    // Fetch the IP account to determine the next revision.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ipAccount = await (
      this.client.program.account as any
    ).ipAccount.fetch(params.ip);
    const nextRevision =
      BigInt(
        (ipAccount.currentMetadataRevision as bigint | number).toString(),
      ) + BigInt(1);

    const [metadata] = deriveIpMetadataPda(
      params.ip,
      nextRevision,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createIpMetadata(
        toFixedBytes(params.dataHash, 32, "dataHash"),
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
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  async createIpMetadata(
    params: CreateIpMetadataParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<IpMetadataCreated>> {
    await validateEntityAuthority(
      this.client,
      params.ownerEntity,
      params.controllerSigners,
    );
    const instruction = await this.createIpMetadataIx(params);
    return sendInstruction<IpMetadataCreated>(
      this.client.provider,
      instruction,
      this.client.program,
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
