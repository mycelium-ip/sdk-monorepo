import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { deriveLicensePda } from "../../pda/license";
import type {
  CreateLicenseParams,
  LicenseCreated,
  LicenseRevoked,
  LicenseUpdated,
  RevokeLicenseParams,
  SendTxOptions,
  TransactionResult,
  UpdateLicenseParams,
} from "../../types";
import { sendInstruction } from "../../utils/transactions";
import {
  validateEntityAuthorityRaw,
  validateAccountExists,
} from "../../utils/validation";
import type { LicenseClient } from "./LicenseClient";

export class LicenseModule {
  constructor(private readonly client: LicenseClient) {}

  async createIx(params: CreateLicenseParams): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const [license] = deriveLicensePda(
      params.originIp,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createLicense(
        params.derivativesAllowed,
        params.ipCoreProgramId ?? this.client.ipCoreProgramId,
      )
      .accountsPartial({
        license,
        originIp: params.originIp,
        ownerEntity: params.ownerEntity,
        controller: params.controller ?? payer,
        derivativeCheck:
          params.derivativeCheck ?? this.client.program.programId,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async create(
    params: CreateLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseCreated>> {
    await Promise.all([
      validateEntityAuthorityRaw(this.client.ipCoreProgram, params.ownerEntity),
      validateAccountExists(
        this.client.provider.connection,
        params.originIp,
        "IP",
      ),
    ]);
    const instruction = await this.createIx(params);
    return sendInstruction<LicenseCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async updateIx(params: UpdateLicenseParams): Promise<TransactionInstruction> {
    const [license] = deriveLicensePda(
      params.originIp,
      this.client.program.programId,
    );
    return this.client.program.methods
      .updateLicense(
        params.derivativesAllowed,
        params.ipCoreProgramId ?? this.client.ipCoreProgramId,
      )
      .accountsPartial({
        license,
        authorityEntity: params.authorityEntity,
        controller: params.controller ?? this.client.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async update(
    params: UpdateLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseUpdated>> {
    await validateEntityAuthorityRaw(
      this.client.ipCoreProgram,
      params.authorityEntity,
    );
    const instruction = await this.updateIx(params);
    return sendInstruction<LicenseUpdated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async revokeIx(params: RevokeLicenseParams): Promise<TransactionInstruction> {
    const rentDestination = this.resolveWalletPubkey(params.rentDestination);
    const [license] = deriveLicensePda(
      params.originIp,
      this.client.program.programId,
    );
    return this.client.program.methods
      .revokeLicense(params.ipCoreProgramId ?? this.client.ipCoreProgramId)
      .accountsPartial({
        license,
        authorityEntity: params.authorityEntity,
        controller: params.controller ?? this.client.provider.wallet.publicKey,
        rentDestination,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async revoke(
    params: RevokeLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseRevoked>> {
    await validateEntityAuthorityRaw(
      this.client.ipCoreProgram,
      params.authorityEntity,
    );
    const instruction = await this.revokeIx(params);
    return sendInstruction<LicenseRevoked>(
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
