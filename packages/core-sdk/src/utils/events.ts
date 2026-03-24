import type { Program } from "@coral-xyz/anchor";
import { EventParser } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";

/**
 * A parsed Anchor event with its name preserved.
 *
 * The `name` field corresponds to the camelCase event name from the IDL
 * (e.g., "entityCreated", "ipMetadataCreated").
 */
export interface ParsedEvent<E = unknown> {
  /** The camelCase event name from the IDL. */
  name: string;
  /** The decoded event data. */
  data: E;
}

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
 * @returns Array of parsed events with name and data
 */
export async function parseTransactionEvents(
  connection: Connection,
  signature: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: Program<any>,
): Promise<ParsedEvent[]> {
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
  const events: ParsedEvent[] = [];

  for (const event of parser.parseLogs(logs)) {
    events.push({ name: event.name, data: event.data });
  }

  return events;
}

/**
 * Find an event by its name from a list of parsed events.
 *
 * Use this to filter events from transactions that emit multiple events,
 * instead of relying on array index order which is fragile.
 *
 * @param events - Array of parsed events from `parseTransactionEvents`
 * @param name   - The camelCase event name to find (e.g., "entityCreated")
 * @returns The event data if found, otherwise undefined
 *
 * @example
 * ```ts
 * const events = await parseTransactionEvents(connection, sig, program);
 * const entityCreated = findEventByName<EntityCreated>(events, "entityCreated");
 * const metadataCreated = findEventByName<EntityMetadataCreated>(events, "entityMetadataCreated");
 * ```
 */
export function findEventByName<E>(
  events: ParsedEvent[],
  name: string,
): E | undefined {
  const event = events.find((e) => e.name === name);
  return event?.data as E | undefined;
}
