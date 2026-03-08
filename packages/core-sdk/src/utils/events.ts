import type { Program } from "@coral-xyz/anchor";
import { EventParser } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";

/**
 * Fetches a confirmed transaction by signature and parses Anchor events from
 * its log messages.
 *
 * After `sendAndConfirm` resolves, the transaction is already confirmed so one
 * `getTransaction` call is sufficient. A single retry after a short delay is
 * attempted when the RPC node hasn't yet indexed the transaction.
 *
 * @param connection - Solana RPC connection
 * @param signature  - Transaction signature returned by `sendAndConfirm`
 * @param program    - Anchor `Program` whose event coder is used for decoding
 * @returns Array of decoded events cast to `E`
 */
export async function parseTransactionEvents<E>(
  connection: Connection,
  signature: string,
  program: Program,
): Promise<E[]> {
  let tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  // Retry once after a short delay in case the RPC hasn't indexed it yet.
  if (!tx) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  }

  if (!tx) {
    return [];
  }

  const logs = tx.meta?.logMessages;
  if (!logs || logs.length === 0) {
    return [];
  }

  const parser = new EventParser(program.programId, program.coder);
  const events: E[] = [];

  for (const event of parser.parseLogs(logs)) {
    events.push(event.data as E);
  }

  return events;
}
