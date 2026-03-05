import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { IP_CORE_PROGRAM_ID } from "../../constants/programs";
import { deriveLicenseGrantPda, deriveLicensePda } from "../../pda/license";
import type {
  CreateLicenseGrantParams,
  RevokeLicenseGrantParams,
  SendTxOptions,
} from "../../types";
import { toI64Bn } from "../../utils/conversions";
import { sendInstruction } from "../../utils/transactions";
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
        params.ipCoreProgramId ?? IP_CORE_PROGRAM_ID,
      )
      .accounts({
        licenseGrant,
        license,
        authorityEntity: params.authorityEntity,
        granteeEntity: params.granteeEntity,
        payer,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async create(
    params: CreateLicenseGrantParams,
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
      .revokeLicenseGrant(params.ipCoreProgramId ?? IP_CORE_PROGRAM_ID)
      .accounts({
        licenseGrant,
        license,
        authorityEntity: params.authorityEntity,
        rentDestination,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  async revoke(
    params: RevokeLicenseGrantParams,
    options?: SendTxOptions,
  ): Promise<string> {
    const instruction = await this.revokeIx(params);
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
