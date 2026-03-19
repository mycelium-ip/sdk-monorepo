import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds } from "../../constants/programs";
import type {
  AccountWithPublicKey,
  LicenseAccount,
  LicenseFilter,
  LicenseGrantAccount,
  LicenseGrantFilter,
  MyceliumCluster,
  PaginatedResult,
  PaginationOptions,
} from "../../types";
import {
  findEventByName,
  parseTransactionEvents,
  type ParsedEvent,
} from "../../utils/events";
import {
  buildLicenseFilters,
  buildLicenseGrantFilters,
  paginate,
} from "../../utils/filters";
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

  // -----------------------------------------------------------------------
  // Single-account fetches
  // -----------------------------------------------------------------------

  /**
   * Fetch a license account from the chain.
   *
   * @param license - The license PDA address
   * @returns The on-chain license data, or `null` if the account does not exist
   */
  async fetchLicense(license: PublicKey): Promise<LicenseAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).license.fetch(
        license,
      );
      return {
        originIp: account.originIp,
        authority: account.authority,
        derivativesAllowed: account.derivativesAllowed,
        createdAt: BigInt(account.createdAt.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch a license grant account from the chain.
   *
   * @param grant - The license grant PDA address
   * @returns The on-chain grant data, or `null` if the account does not exist
   */
  async fetchLicenseGrant(
    grant: PublicKey,
  ): Promise<LicenseGrantAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).licenseGrant.fetch(
        grant,
      );
      return {
        license: account.license,
        grantee: account.grantee,
        grantedAt: BigInt(account.grantedAt.toString()),
        expiration: BigInt(account.expiration.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  // -----------------------------------------------------------------------
  // Multi-account queries with filtering and pagination
  // -----------------------------------------------------------------------

  /**
   * Find all license accounts matching the given filter.
   *
   * @param filter     - Optional filter by `originIp` and/or `authority`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findLicenses(
    filter?: LicenseFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<LicenseAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).license.all(
      buildLicenseFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          originIp: item.account.originIp,
          authority: item.account.authority,
          derivativesAllowed: item.account.derivativesAllowed,
          createdAt: BigInt(item.account.createdAt.toString()),
          bump: item.account.bump,
        } as LicenseAccount,
      }),
    );
    return paginate(mapped, pagination);
  }

  /**
   * Find all license grant accounts matching the given filter.
   *
   * @param filter     - Optional filter by `license` and/or `grantee`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findLicenseGrants(
    filter?: LicenseGrantFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<LicenseGrantAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).licenseGrant.all(
      buildLicenseGrantFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          license: item.account.license,
          grantee: item.account.grantee,
          grantedAt: BigInt(item.account.grantedAt.toString()),
          expiration: BigInt(item.account.expiration.toString()),
          bump: item.account.bump,
        } as LicenseGrantAccount,
      }),
    );
    return paginate(mapped, pagination);
  }
}
