import type {
  Commitment,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import type { MyceliumWallet } from "../types/wallet";

/**
 * Result of executing a transaction.
 */
export interface TransactionResult {
  /** Transaction signature */
  signature: string;
}

/**
 * Execute the full transaction lifecycle.
 *
 * 1. Build transaction from instruction
 * 2. Set recent blockhash
 * 3. Sign transaction using wallet
 * 4. Send transaction to the network
 * 5. Confirm transaction with specified commitment level
 *
 * @param connection - Solana RPC connection
 * @param wallet - Wallet for signing
 * @param instruction - Transaction instruction to execute
 * @param confirmation - Commitment level for confirmation
 * @returns Transaction signature
 *
 * @throws Error if wallet is not connected (no publicKey)
 */
export async function executeTransaction(
  connection: Connection,
  wallet: MyceliumWallet,
  instruction: TransactionInstruction,
  confirmation: Commitment,
): Promise<TransactionResult> {
  if (!wallet.publicKey) {
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
