import type { Wallet, WalletAccount } from "@wallet-standard/base";
import {
  type SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionOutput,
  type SolanaSignMessageFeature,
  SolanaSignMessage,
  type SolanaSignTransactionFeature,
  SolanaSignTransaction,
} from "@solana/wallet-standard-features";
import type { SolanaChain } from "@solana/wallet-standard-chains";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { UnsupportedFeatureError } from "./errors";
import { walletSupportsFeature } from "./guards";

type WalletWithSignTransaction = Wallet & {
  features: SolanaSignTransactionFeature;
};

/**
 * Internal wrapper around a Wallet Standard–compliant wallet.
 *
 * Provides a simplified, SDK-friendly API and guarantees that the required
 * `solana:signTransaction` feature is present at construction time.
 *
 * The wrapper also satisfies the shape that Anchor's `AnchorProvider`
 * expects (`publicKey`, `signTransaction`, `signAllTransactions`), so it
 * can be passed directly to `createProvider`.
 */
export class StandardWalletWrapper {
  /** The underlying Wallet Standard wallet. */
  readonly wallet: WalletWithSignTransaction;

  /** The active account used for signing. */
  readonly account: WalletAccount;

  /** The public key derived from the active account. */
  readonly publicKey: PublicKey;

  constructor(wallet: Wallet, accountIndex = 0) {
    if (!walletSupportsFeature(wallet, SolanaSignTransaction)) {
      throw new UnsupportedFeatureError(SolanaSignTransaction);
    }

    const account = wallet.accounts[accountIndex];
    if (!account) {
      throw new Error(
        `Wallet has no account at index ${accountIndex}. ` +
          `Available accounts: ${wallet.accounts.length}`,
      );
    }

    this.wallet = wallet as WalletWithSignTransaction;
    this.account = account;
    this.publicKey = new PublicKey(account.publicKey);
  }

  /** Check whether the wallet exposes a given feature identifier. */
  supportsFeature(feature: string): boolean {
    return walletSupportsFeature(this.wallet, feature);
  }

  // ---------------------------------------------------------------------------
  // signTransaction  (required – validated in constructor)
  // ---------------------------------------------------------------------------

  /**
   * Sign a single transaction via `solana:signTransaction`.
   *
   * Serialises the transaction to bytes, passes it through the wallet feature,
   * and deserialises the signed bytes back into the same transaction type.
   */
  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T> {
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const [output] = await this.wallet.features[
      SolanaSignTransaction
    ].signTransaction({
      account: this.account,
      transaction: new Uint8Array(serialized),
    });

    return deserializeTransaction(output.signedTransaction, transaction) as T;
  }

  /**
   * Sign multiple transactions sequentially.
   *
   * The Wallet Standard `solana:signTransaction` accepts variadic inputs so
   * we batch them into a single call for wallets that optimise multi-sign.
   */
  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ): Promise<T[]> {
    const inputs = transactions.map((tx) => ({
      account: this.account,
      transaction: new Uint8Array(
        tx.serialize({ requireAllSignatures: false, verifySignatures: false }),
      ),
    }));

    const outputs = await this.wallet.features[
      SolanaSignTransaction
    ].signTransaction(...inputs);

    return outputs.map(
      (output, i) =>
        deserializeTransaction(output.signedTransaction, transactions[i]) as T,
    );
  }

  // ---------------------------------------------------------------------------
  // signAndSendTransaction  (optional)
  // ---------------------------------------------------------------------------

  /**
   * Sign **and** send a transaction via `solana:signAndSendTransaction`.
   *
   * @returns The transaction signature as a base-58 string.
   * @throws {UnsupportedFeatureError} if the wallet does not support this feature.
   */
  async signAndSendTransaction(
    transaction: Transaction | VersionedTransaction,
    chain: SolanaChain,
  ): Promise<SolanaSignAndSendTransactionOutput> {
    if (!this.supportsFeature(SolanaSignAndSendTransaction)) {
      throw new UnsupportedFeatureError(SolanaSignAndSendTransaction);
    }

    const features = this.wallet
      .features as SolanaSignAndSendTransactionFeature &
      SolanaSignTransactionFeature;

    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const [output] = await features[
      SolanaSignAndSendTransaction
    ].signAndSendTransaction({
      account: this.account,
      transaction: new Uint8Array(serialized),
      chain,
    });

    return output;
  }

  // ---------------------------------------------------------------------------
  // signMessage  (optional)
  // ---------------------------------------------------------------------------

  /**
   * Sign an arbitrary message via `solana:signMessage`.
   *
   * @returns The raw signature bytes.
   * @throws {UnsupportedFeatureError} if the wallet does not support this feature.
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.supportsFeature(SolanaSignMessage)) {
      throw new UnsupportedFeatureError(SolanaSignMessage);
    }

    const features = this.wallet.features as SolanaSignMessageFeature &
      SolanaSignTransactionFeature;

    const [output] = await features[SolanaSignMessage].signMessage({
      account: this.account,
      message,
    });

    return output.signature;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deserialise raw signed-transaction bytes back into the same transaction type
 * (`Transaction` or `VersionedTransaction`) as the original.
 */
function deserializeTransaction(
  bytes: Uint8Array,
  original: Transaction | VersionedTransaction,
): Transaction | VersionedTransaction {
  if (original instanceof VersionedTransaction) {
    return VersionedTransaction.deserialize(bytes);
  }
  return Transaction.from(bytes);
}
