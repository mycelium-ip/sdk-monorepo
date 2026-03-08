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
      .accounts({
        license,
        originIp: params.originIp,
        ownerEntity: params.ownerEntity,
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
      .accounts({
        license,
        authorityEntity: params.authorityEntity,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async update(
    params: UpdateLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseUpdated>> {
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
      .accounts({
        license,
        authorityEntity: params.authorityEntity,
        rentDestination,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async revoke(
    params: RevokeLicenseParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseRevoked>> {
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
