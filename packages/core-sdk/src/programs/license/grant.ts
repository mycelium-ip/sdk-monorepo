import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { deriveLicenseGrantPda, deriveLicensePda } from "../../pda/license";
import type {
  CreateLicenseGrantParams,
  LicenseGrantCreated,
  LicenseGrantRevoked,
  RevokeLicenseGrantParams,
  SendTxOptions,
  TransactionResult,
} from "../../types";
import { toI64Bn } from "../../utils/bn";
import { sendInstruction } from "../../utils/transactions";
import { buildSignerMetas } from "../../utils/accounts";
import type { LicenseClient } from "./LicenseClient";

export class GrantModule {
  constructor(private readonly client: LicenseClient) {}

  async createIx(
    params: CreateLicenseGrantParams,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const [license] = deriveLicensePda(
      params.originIp,
      this.client.program.programId,
    );
    const [licenseGrant] = deriveLicenseGrantPda(
      license,
      params.granteeEntity,
      this.client.program.programId,
    );

    return this.client.program.methods
      .createLicenseGrant(
        toI64Bn(params.expiration, "expiration"),
        params.ipCoreProgramId ?? this.client.ipCoreProgramId,
      )
      .accounts({
        licenseGrant,
        license,
        authorityEntity: params.authorityEntity,
        granteeEntity: params.granteeEntity,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  async create(
    params: CreateLicenseGrantParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseGrantCreated>> {
    const instruction = await this.createIx(params);
    return sendInstruction<LicenseGrantCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async revokeIx(
    params: RevokeLicenseGrantParams,
  ): Promise<TransactionInstruction> {
    const [license] = deriveLicensePda(
      params.originIp,
      this.client.program.programId,
    );
    const [licenseGrant] = deriveLicenseGrantPda(
      license,
      params.granteeEntity,
      this.client.program.programId,
    );
    const rentDestination = this.resolveWalletPubkey(params.rentDestination);

    return this.client.program.methods
      .revokeLicenseGrant(params.ipCoreProgramId ?? this.client.ipCoreProgramId)
      .accounts({
        licenseGrant,
        license,
        authorityEntity: params.authorityEntity,
        rentDestination,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  async revoke(
    params: RevokeLicenseGrantParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<LicenseGrantRevoked>> {
    const instruction = await this.revokeIx(params);
    return sendInstruction<LicenseGrantRevoked>(
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
