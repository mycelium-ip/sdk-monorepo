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
import { sha256Hash, toFixedBytes, utf8Bytes } from "../../utils/conversions";
import { sendInstruction } from "../../utils/transactions";
import type { IpCoreClient } from "./IpCoreClient";

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export class IpModule {
  constructor(private readonly client: IpCoreClient) {}

  async createIx(params: CreateIpParams): Promise<TransactionInstruction> {
    const payer = this.resolveWalletPubkey(params.payer);
    const contentHash = sha256Hash(params.content);
    const [ip] = deriveIpPda(
      params.registrantEntity,
      contentHash,
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

    // Derive token accounts if not provided
    let treasuryTokenAccount = params.treasuryTokenAccount;
    let payerTokenAccount = params.payerTokenAccount;

    if (!treasuryTokenAccount || !payerTokenAccount) {
      const protocolConfig = await this.client.fetchConfig();
      const mint = protocolConfig.registrationCurrency;

      if (!treasuryTokenAccount) {
        treasuryTokenAccount = deriveAta(mint, treasury);
      }
      if (!payerTokenAccount) {
        payerTokenAccount = deriveAta(mint, payer);
      }
    }

    return this.client.program.methods
      .createIp(toFixedBytes(contentHash, 32, "contentHash"))
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
      .instruction();
  }

  async create(
    params: CreateIpParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<IpCreated>> {
    const instruction = await this.createIx(params);
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
      .instruction();
  }

  async transfer(
    params: TransferIpParams,
    options?: SendTxOptions,
  ): Promise<TransactionResult<IpTransferred>> {
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
