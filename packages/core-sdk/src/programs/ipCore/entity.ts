import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import {
  deriveCreatorEntityCounterPda,
  deriveEntityPda,
} from "../../pda/entity";
import type {
  CreateEntityParams,
  EntityControlTransferred,
  EntityCreated,
  SendTxOptions,
  TransactionResult,
  TransferEntityControlParams,
} from "../../types";
import { sendInstruction } from "../../utils/transactions";
import { validateEntityAuthority } from "../../utils/validation";
import type { IpCoreClient } from "./IpCoreClient";

export class EntityModule {
  constructor(private readonly client: IpCoreClient) {}

  async createIx(params: CreateEntityParams): Promise<TransactionInstruction> {
    const creator = this.resolveWalletPubkey(params.creator);
    const entityCount = await this.client.fetchEntityCount(creator);

    const [counter] = deriveCreatorEntityCounterPda(
      creator,
      this.client.program.programId,
    );
    const [entity] = deriveEntityPda(
      creator,
      entityCount,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createEntity()
      .accountsPartial({
        counter,
        entity,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async create(
    params: CreateEntityParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<EntityCreated>> {
    const instruction = await this.createIx(params);
    return sendInstruction<EntityCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async transferControlIx(
    params: TransferEntityControlParams,
  ): Promise<TransactionInstruction> {
    const controller =
      params.controller ?? this.client.provider.wallet.publicKey;
    return this.client.program.methods
      .transferEntityControl(params.newController)
      .accountsPartial({
        entity: params.entity,
        controller,
      })
      .instruction();
  }

  async transferControl(
    params: TransferEntityControlParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<EntityControlTransferred>> {
    await validateEntityAuthority(this.client, params.entity);
    const instruction = await this.transferControlIx(params);
    return sendInstruction<EntityControlTransferred>(
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
