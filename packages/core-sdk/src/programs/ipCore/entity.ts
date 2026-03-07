import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { deriveEntityPda } from "../../pda/entity";
import type {
  CreateEntityParams,
  SendTxOptions,
  UpdateEntityControllersParams,
} from "../../types";
import { toFixedBytes } from "../../utils/conversions";
import { sendInstruction } from "../../utils/transactions";
import type { IpCoreClient } from "./IpCoreClient";

export class EntityModule {
  constructor(private readonly client: IpCoreClient) {}

  async createIx(params: CreateEntityParams): Promise<TransactionInstruction> {
    const creator = this.resolveWalletPubkey(params.creator);
    const [entity] = deriveEntityPda(
      creator,
      params.handle,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createEntity(
        toFixedBytes(params.handle, 32, "handle"),
        params.additionalControllers ?? [],
        params.signatureThreshold ?? 1,
      )
      .accounts({
        entity,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async create(
    params: CreateEntityParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.createIx(params);
    return sendInstruction(
      this.client.provider,
      instruction,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async updateControllersIx(
    params: UpdateEntityControllersParams,
  ): Promise<TransactionInstruction> {
    return this.client.program.methods
      .updateEntityControllers(params.newControllers, params.newThreshold)
      .accounts({
        entity: params.entity,
      })
      .instruction();
  }

  async updateControllers(
    params: UpdateEntityControllersParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.updateControllersIx(params);
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
