import type {
  Commitment,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import type {
  MyceliumCluster,
  StandardWalletWrapper,
} from "@mycelium-ip/core-sdk";
import {
  SOLANA_DEVNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  type SolanaChain,
} from "@solana/wallet-standard-chains";
import bs58 from "bs58";

/**
 * Result of executing a transaction.
 *
 * The `event` field is populated when an `eventParser` is provided to
 * `executeTransaction`. It contains the first strongly-typed Anchor event
 * decoded from the transaction logs.
 */
export interface TransactionResult<E = void> {
  /** Transaction signature */
  signature: string;
  /** Decoded Anchor event (only present when an eventParser was supplied). */
  event?: E;
}

/**
 * Execute the full transaction lifecycle.
 *
 * When the wallet supports `solana:signAndSendTransaction`, that feature is
 * preferred (the wallet handles signing and sending in one step). Otherwise
 * the function falls back to signing locally and sending via the RPC
 * connection.
 *
 * @param connection   - Solana RPC connection
 * @param wallet       - StandardWalletWrapper for signing
 * @param instruction  - Transaction instruction to execute
 * @param confirmation - Commitment level for confirmation
 * @param chain        - Solana chain identifier (e.g. "solana:devnet")
 * @param eventParser  - Optional async callback that receives `(connection, signature)` and returns a decoded event
 * @returns TransactionResult including signature and optional event
 *
 * @throws Error if wallet is not connected (no publicKey)
 */
export async function executeTransaction<E = void>(
  connection: Connection,
  wallet: StandardWalletWrapper | null,
  instruction: TransactionInstruction,
  confirmation: Commitment,
  chain: SolanaChain,
  eventParser?: (connection: Connection, signature: string) => Promise<E>,
): Promise<TransactionResult<E>> {
  if (!wallet) {
    throw new Error("Wallet not connected");
  }

  // Build the transaction
  const transaction = new Transaction().add(instruction);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash(confirmation);
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  let signature: string;

  if (wallet.supportsFeature("solana:signAndSendTransaction")) {
    // Preferred path: wallet signs + sends in one step
    const output = await wallet.signAndSendTransaction(transaction, chain);
    signature = bs58.encode(output.signature);
  } else {
    // Fallback: sign locally, send via connection
    const signed = await wallet.signTransaction(transaction);
    signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: confirmation,
    });
  }

  // Confirm the transaction
  await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    confirmation,
  );

  if (eventParser) {
    const event = await eventParser(connection, signature);
    return { signature, event };
  }

  return { signature };
}

/**
 * Execute multiple instructions in a single transaction.
 *
 * @param connection - Solana RPC connection
 * @param wallet - StandardWalletWrapper for signing
 * @param instructions - Transaction instructions to execute
 * @param confirmation - Commitment level for confirmation
 * @param chain - Solana chain identifier (e.g. "solana:devnet")
 * @returns Transaction signature
 *
 * @throws Error if wallet is not connected (no publicKey)
 */
export async function executeTransactionWithInstructions(
  connection: Connection,
  wallet: StandardWalletWrapper,
  instructions: TransactionInstruction[],
  confirmation: Commitment,
  chain: SolanaChain,
): Promise<TransactionResult> {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  // Build the transaction with all instructions
  const transaction = new Transaction();
  for (const ix of instructions) {
    transaction.add(ix);
  }

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash(confirmation);
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  let signature: string;

  if (wallet.supportsFeature("solana:signAndSendTransaction")) {
    const output = await wallet.signAndSendTransaction(transaction, chain);
    signature = bs58.encode(output.signature);
  } else {
    const signed = await wallet.signTransaction(transaction);
    signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: confirmation,
    });
  }

  // Confirm the transaction
  await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    confirmation,
  );

  return { signature };
}

/**
 * Map a {@link MyceliumCluster} to its Wallet Standard {@link SolanaChain}.
 */
export function clusterToChain(cluster: MyceliumCluster): SolanaChain {
  switch (cluster) {
    case "mainnet-beta":
      return SOLANA_MAINNET_CHAIN;
    case "devnet":
      return SOLANA_DEVNET_CHAIN;
  }
}
