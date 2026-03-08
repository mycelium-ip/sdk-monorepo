import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { deriveDerivativeLinkPda } from "../../pda/derivative";
import type {
  CreateDerivativeLinkParams,
  DerivativeLicenseUpdated,
  DerivativeLinkCreated,
  SendTxOptions,
  TransactionResult,
  UpdateDerivativeLicenseParams,
} from "../../types";
import { sendInstruction } from "../../utils/transactions";
import type { IpCoreClient } from "./IpCoreClient";

export class DerivativeModule {
  constructor(private readonly client: IpCoreClient) {}

  async createIx(
    params: CreateDerivativeLinkParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const [derivativeLink] = deriveDerivativeLinkPda(
      params.parentIp,
      params.childIp,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createDerivativeLink(
        params.licenseProgramId ?? this.client.licenseProgramId,
      )
      .accounts({
        derivativeLink,
        parentIp: params.parentIp,
        childIp: params.childIp,
        childOwnerEntity: params.childOwnerEntity,
        licenseGrant: params.licenseGrant,
        license: params.license,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async create(
    params: CreateDerivativeLinkParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<DerivativeLinkCreated>> {
    const instruction = await this.createIx(params);
    return sendInstruction<DerivativeLinkCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async updateLicenseIx(
    params: UpdateDerivativeLicenseParams,
  ): Promise<TransactionInstruction> {
    const [derivedDerivativeLink] = deriveDerivativeLinkPda(
      params.parentIp,
      params.childIp,
      this.client.program.programId,
    );

    return this.client.program.methods
      .updateDerivativeLicense(
        params.licenseProgramId ?? this.client.licenseProgramId,
      )
      .accounts({
        derivativeLink: params.derivativeLink ?? derivedDerivativeLink,
        childIp: params.childIp,
        childOwnerEntity: params.childOwnerEntity,
        parentIp: params.parentIp,
        newLicenseGrant: params.newLicenseGrant,
        newLicense: params.newLicense,
      })
      .instruction();
  }

  async updateLicense(
    params: UpdateDerivativeLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<DerivativeLicenseUpdated>> {
    const instruction = await this.updateLicenseIx(params);
    return sendInstruction<DerivativeLicenseUpdated>(
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
