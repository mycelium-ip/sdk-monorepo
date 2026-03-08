import type {
  Commitment,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import type { MyceliumWallet } from "../types/wallet";

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
 * 1. Build transaction from instruction
 * 2. Set recent blockhash
 * 3. Sign transaction using wallet
 * 4. Send transaction to the network
 * 5. Confirm transaction with specified commitment level
 * 6. Optionally parse and attach a strongly-typed Anchor event
 *
 * @param connection   - Solana RPC connection
 * @param wallet       - Wallet for signing
 * @param instruction  - Transaction instruction to execute
 * @param confirmation - Commitment level for confirmation
 * @param eventParser  - Optional async callback that receives `(connection, signature)` and returns a decoded event
 * @returns TransactionResult including signature and optional event
 *
 * @throws Error if wallet is not connected (no publicKey)
 */
export async function executeTransaction<E = void>(
  connection: Connection,
  wallet: MyceliumWallet | null,
  instruction: TransactionInstruction,
  confirmation: Commitment,
  eventParser?: (connection: Connection, signature: string) => Promise<E>,
): Promise<TransactionResult<E>> {
  if (!wallet?.publicKey) {
    throw new Error("Wallet not connected");
  }

  // Build the transaction
  const transaction = new Transaction().add(instruction);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash(confirmation);
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Sign the transaction
  const signed = await wallet.signTransaction(transaction);

  // Send the transaction
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: confirmation,
  });

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
 * @param wallet - Wallet for signing
 * @param instructions - Transaction instructions to execute
 * @param confirmation - Commitment level for confirmation
 * @returns Transaction signature
 *
 * @throws Error if wallet is not connected (no publicKey)
 */
export async function executeTransactionWithInstructions(
  connection: Connection,
  wallet: MyceliumWallet,
  instructions: TransactionInstruction[],
  confirmation: Commitment,
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

  // Sign the transaction
  const signed = await wallet.signTransaction(transaction);

  // Send the transaction
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: confirmation,
  });

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
