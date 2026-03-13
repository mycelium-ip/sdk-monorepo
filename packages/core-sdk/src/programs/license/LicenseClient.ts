import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds } from "../../constants/programs";
import type { MyceliumCluster } from "../../types";
import {
  findEventByName,
  parseTransactionEvents,
  type ParsedEvent,
} from "../../utils/events";
import { GrantModule } from "./grant";
import { LicenseModule } from "./license";

export class LicenseClient {
  readonly provider: AnchorProvider;
  readonly program: Program;
  readonly ipCoreProgramId: PublicKey;
  /** @internal ip_core program instance for entity account deserialization. */
  readonly ipCoreProgram: Program;

  readonly license: LicenseModule;
  readonly grant: GrantModule;

  constructor(provider: AnchorProvider, cluster: MyceliumCluster = "devnet") {
    const programIds = getProgramIds(cluster);
    const idls = getIdls(cluster);

    this.ipCoreProgramId = programIds.ipCore;
    this.provider = provider;
    this.program = new Program(idls.license, provider);
    this.ipCoreProgram = new Program(idls.ipCore, provider);

    this.license = new LicenseModule(this);
    this.grant = new GrantModule(this);
  }

  /**
   * Parse the first Anchor event of type `E` from a confirmed transaction.
   *
   * This returns the first event's data, suitable for single-event transactions.
   * For transactions with multiple events, use `parseEvents` and filter by name.
   *
   * React hooks use this as an `eventParser` callback so the React package
   * does not need a direct dependency on `@coral-xyz/anchor`.
   *
   * @param connection - Solana RPC connection
   * @param signature  - Transaction signature
   */
  async parseEvent<E>(connection: Connection, signature: string): Promise<E> {
    const events = await parseTransactionEvents(
      connection,
      signature,
      this.program,
    );
    return events[0]?.data as E;
  }

  /**
   * Parse all Anchor events from a confirmed transaction.
   *
   * Use this when a single transaction emits multiple events (e.g. composite
   * instructions). React hooks use this as an `eventParser` callback so the
   * React package does not need a direct dependency on `@coral-xyz/anchor`.
   *
   * @param connection - Solana RPC connection
   * @param signature  - Transaction signature
   */
  async parseEvents(
    connection: Connection,
    signature: string,
  ): Promise<ParsedEvent[]> {
    return parseTransactionEvents(connection, signature, this.program);
  }

  /**
   * Find an event by name from an array of parsed events.
   *
   * Use this to safely extract specific events from transactions that emit
   * multiple events, rather than relying on array index order.
   *
   * @param events - Array of parsed events from `parseEvents`
   * @param name   - The camelCase event name (e.g., "licenseCreated")
   * @returns The event data if found, otherwise undefined
   */
  findEventByName<E>(events: ParsedEvent[], name: string): E | undefined {
    return findEventByName<E>(events, name);
  }
}
