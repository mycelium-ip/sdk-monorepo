import type {
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Wallet-agnostic interface for transaction signing.
 *
 * This interface allows consumers to adapt any wallet implementation
 * (Solana Wallet Adapter, Privy, embedded wallets) without introducing
 * direct dependencies on specific wallet libraries.
 *
 * @example Solana Wallet Adapter
 * ```ts
 * const wallet: MyceliumWallet = {
 *   publicKey: walletAdapter.publicKey,
 *   signTransaction: walletAdapter.signTransaction,
 *   signAllTransactions: walletAdapter.signAllTransactions,
 * };
 * ```
 *
 * @example Privy Wallet
 * ```ts
 * const wallet: MyceliumWallet = {
 *   publicKey: new PublicKey(privyWallet.address),
 *   signTransaction: privyWallet.signTransaction,
 *   signMessage: privyWallet.signMessage,
 * };
 * ```
 */
export interface MyceliumWallet {
  /**
   * The public key of the connected wallet.
   * May be null if no wallet is connected.
   */
  publicKey: PublicKey | null;

  /**
   * Signs a single transaction.
   * @param transaction - The transaction to sign
   * @returns The signed transaction
   */
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T>;

  /**
   * Signs multiple transactions at once.
   * Optional - not all wallets support batch signing.
   * @param transactions - The transactions to sign
   * @returns The signed transactions
   */
  signAllTransactions?<T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ): Promise<T[]>;

  /**
   * Signs an arbitrary message.
   * Optional - not all wallets support message signing.
   * @param message - The message bytes to sign
   * @returns The signature bytes
   */
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}
