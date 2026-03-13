import { PublicKey } from "@solana/web3.js";
import type { TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { PDA_SEEDS } from "../../constants/programs";
import { deriveIpPda } from "../../pda/ip";
import type {
  CreateIpParams,
  IpCreated,
  IpTransferred,
  SendTxOptions,
  TransactionResult,
  TransferIpParams,
} from "../../types";
import { deriveAta } from "../../utils/ata";
import { buildSignerMetas } from "../../utils/accounts";
import { toFixedBytes, utf8Bytes } from "../../utils/bytes";
import { sendInstruction } from "../../utils/transactions";
import {
  validateIpRegistration,
  validateEntityAuthority,
  type PreflightResult,
} from "../../utils/validation";
import type { IpCoreClient } from "./IpCoreClient";

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export class IpModule {
  constructor(private readonly client: IpCoreClient) {}

  async createIx(
    params: CreateIpParams,
    /** @internal — pre-fetched data from preflight validation. */
    _prefetched?: PreflightResult,
  ): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    if (params.contentHash.length !== 32) {
      throw new Error(
        `contentHash must be exactly 32 bytes (SHA-256 hash), got ${params.contentHash.length}`,
      );
    }
    const [ip] = deriveIpPda(
      params.registrantEntity,
      params.contentHash,
      this.client.program.programId,
    );
    const [config] = PublicKey.findProgramAddressSync(
      [utf8Bytes(PDA_SEEDS.config)],
      this.client.program.programId,
    );
    const [treasury] = PublicKey.findProgramAddressSync(
      [utf8Bytes(PDA_SEEDS.treasury)],
      this.client.program.programId,
    );

    // Use prefetched token accounts when available, otherwise derive them
    let treasuryTokenAccount =
      _prefetched?.treasuryTokenAccount ?? params.treasuryTokenAccount;
    let payerTokenAccount =
      _prefetched?.payerTokenAccount ?? params.payerTokenAccount;

    if (!treasuryTokenAccount || !payerTokenAccount) {
      const protocolConfig =
        _prefetched?.config ?? (await this.client.fetchConfig());
      const mint = protocolConfig.registrationCurrency;

      if (!treasuryTokenAccount) {
        treasuryTokenAccount = deriveAta(mint, treasury);
      }
      if (!payerTokenAccount) {
        payerTokenAccount = deriveAta(mint, payer);
      }
    }

    return this.client.program.methods
      .createIp(toFixedBytes(params.contentHash, 32, "contentHash"))
      .accounts({
        ip,
        registrantEntity: params.registrantEntity,
        config,
        treasury,
        treasuryTokenAccount,
        payerTokenAccount,
        payer,
        tokenProgram: new PublicKey(TOKEN_PROGRAM_ID),
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  /**
   * Validate IP registration parameters against on-chain state.
   *
   * Performs read-only RPC checks (entity existence, controller authority,
   * token account existence, and balance sufficiency) and throws a typed
   * error if any check fails. Call this before presenting a wallet approval
   * dialog to give users immediate, actionable feedback.
   */
  async validate(params: CreateIpParams): Promise<void> {
    await validateIpRegistration(this.client, params);
  }

  async create(
    params: CreateIpParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<IpCreated>> {
    const prefetched = await validateIpRegistration(this.client, params);
    const instruction = await this.createIx(params, prefetched);
    return sendInstruction<IpCreated>(
      this.client.provider,
      instruction,
      this.client.program,
      options?.sendOptions,
      options?.confirmOptions,
    );
  }

  async transferIx(params: TransferIpParams): Promise<TransactionInstruction> {
    return this.client.program.methods
      .transferIp()
      .accounts({
        ip: params.ip,
        currentOwnerEntity: params.currentOwnerEntity,
        newOwnerEntity: params.newOwnerEntity,
      })
      .remainingAccounts(buildSignerMetas(params.controllerSigners))
      .instruction();
  }

  async transfer(
    params: TransferIpParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<IpTransferred>> {
    await validateEntityAuthority(
      this.client,
      params.currentOwnerEntity,
      params.controllerSigners,
    );
    const instruction = await this.transferIx(params);
    return sendInstruction<IpTransferred>(
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
