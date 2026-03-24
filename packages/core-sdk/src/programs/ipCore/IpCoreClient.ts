import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { IpCore } from "../../idl/ip_core";
import { getIdls, getProgramIds, PDA_SEEDS } from "../../constants/programs";
import {
  deriveCreatorEntityCounterPda,
  deriveEntityPda,
} from "../../pda/entity";
import { deriveIpPda } from "../../pda/ip";
import {
  deriveEntityMetadataPda,
  deriveIpMetadataPda,
} from "../../pda/metadata";
import type {
  AccountWithPublicKey,
  CreatorEntityCounterAccount,
  DerivativeLinkAccount,
  DerivativeLinkFilter,
  EntityAccount,
  EntityFilter,
  IpAccount,
  IpFilter,
  MetadataAccount,
  MetadataFilter,
  MetadataSchemaAccount,
  MyceliumCluster,
  PaginatedResult,
  PaginationOptions,
  ProtocolConfig,
} from "../../types";
import { utf8Bytes } from "../../utils/bytes";
import {
  findEventByName,
  parseTransactionEvents,
  type ParsedEvent,
} from "../../utils/events";
import {
  buildDerivativeLinkFilters,
  buildEntityFilters,
  buildIpFilters,
  buildMetadataFilters,
  paginate,
} from "../../utils/filters";
import { DerivativeModule } from "./derivative";
import { EntityModule } from "./entity";
import { IpModule } from "./ip";
import { MetadataModule } from "./metadata";

export class IpCoreClient {
  readonly provider: AnchorProvider;
  readonly program: Program<IpCore>;
  readonly licenseProgramId: PublicKey;

  readonly entity: EntityModule;
  readonly ip: IpModule;
  readonly metadata: MetadataModule;
  readonly derivative: DerivativeModule;

  constructor(provider: AnchorProvider, cluster: MyceliumCluster = "devnet") {
    const programIds = getProgramIds(cluster);
    const idls = getIdls(cluster);

    this.licenseProgramId = programIds.license;
    this.provider = provider;
    this.program = new Program<IpCore>(idls.ipCore as IpCore, provider);

    this.entity = new EntityModule(this);
    this.ip = new IpModule(this);
    this.metadata = new MetadataModule(this);
    this.derivative = new DerivativeModule(this);
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
   * @param name   - The camelCase event name (e.g., "entityCreated")
   * @returns The event data if found, otherwise undefined
   */
  findEventByName<E>(events: ParsedEvent[], name: string): E | undefined {
    return findEventByName<E>(events, name);
  }

  /**
   * Derive the entity PDA for the given creator and index.
   *
   * Useful when you need the entity address before the entity has been created
   * on-chain, e.g. to populate subsequent instructions in the same transaction.
   *
   * @param creator - The creator public key
   * @param index   - The entity index (sequential per-creator)
   */
  deriveEntityAddress(creator: PublicKey, index: bigint | number): PublicKey {
    const [pda] = deriveEntityPda(creator, index, this.program.programId);
    return pda;
  }

  /**
   * Derive the creator entity counter PDA for the given creator.
   *
   * @param creator - The creator public key
   */
  deriveCounterAddress(creator: PublicKey): PublicKey {
    const [pda] = deriveCreatorEntityCounterPda(
      creator,
      this.program.programId,
    );
    return pda;
  }

  /**
   * Derive the IP PDA for the given registrant entity and content hash.
   *
   * Useful when you need the IP address before the IP has been created on-chain,
   * e.g. to populate subsequent instructions in the same transaction.
   *
   * @param registrantEntity - The registrant entity public key
   * @param contentHash      - SHA-256 hash of the IP content (32 bytes)
   */
  deriveIpAddress(
    registrantEntity: PublicKey,
    contentHash: Uint8Array,
  ): PublicKey {
    const [pda] = deriveIpPda(
      registrantEntity,
      contentHash,
      this.program.programId,
    );
    return pda;
  }

  /**
   * Derive the entity metadata PDA for the given entity and revision.
   *
   * Useful in compound transactions where the entity is created in the same tx
   * and does not yet exist on-chain, so the metadata PDA must be pre-computed
   * (e.g. for building a combined create-entity + create-metadata instruction).
   *
   * @param entity   - The entity public key
   * @param revision - The metadata revision (1 for the first metadata entry)
   */
  deriveEntityMetadataAddress(
    entity: PublicKey,
    revision: bigint | number,
  ): PublicKey {
    const [pda] = deriveEntityMetadataPda(
      entity,
      revision,
      this.program.programId,
    );
    return pda;
  }

  /**
   * Derive the IP metadata PDA for the given IP and revision.
   *
   * Useful in compound transactions where the IP is created in the same tx
   * and does not yet exist on-chain, so the metadata PDA must be pre-computed
   * (e.g. for building a combined create-IP + create-metadata instruction).
   *
   * @param ip       - The IP public key
   * @param revision - The metadata revision (1 for the first metadata entry)
   */
  deriveIpMetadataAddress(ip: PublicKey, revision: bigint | number): PublicKey {
    const [pda] = deriveIpMetadataPda(ip, revision, this.program.programId);
    return pda;
  }

  /**
   * Derive the protocol config PDA address.
   *
   * @returns The config PDA address
   */
  deriveConfigAddress(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [utf8Bytes(PDA_SEEDS.config)],
      this.program.programId,
    );
    return pda;
  }

  /**
   * Fetch the protocol configuration from the on-chain config account.
   *
   * @returns The protocol configuration
   */
  async fetchConfig(): Promise<ProtocolConfig> {
    const configAddress = this.deriveConfigAddress();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (this.program.account as any).protocolConfig.fetch(
      configAddress,
    );
    return {
      authority: account.authority,
      treasury: account.treasury,
      registrationCurrency: account.registrationCurrency,
      registrationFee: BigInt(account.registrationFee.toString()),
      bump: account.bump,
    };
  }

  /**
   * Fetch the current entity count for a creator.
   *
   * Returns the next index that will be used when creating a new entity.
   * Returns `0` if the creator has not yet created any entities (counter
   * PDA does not exist on-chain).
   *
   * @param creator - The creator public key
   */
  async fetchEntityCount(creator: PublicKey): Promise<number> {
    const counterAddress = this.deriveCounterAddress(creator);
    try {
      const account = await (this.program.account as any).creatorEntityCounter // eslint-disable-line @typescript-eslint/no-explicit-any
        .fetch(counterAddress);
      return Number(account.entityCount.toString());
    } catch {
      return 0;
    }
  }

  /**
   * Fetch a creator entity counter account from the chain.
   *
   * @param creator - The creator public key
   * @returns The counter data, or `null` if it hasn't been initialized
   */
  async fetchCreatorEntityCounter(
    creator: PublicKey,
  ): Promise<CreatorEntityCounterAccount | null> {
    const counterAddress = this.deriveCounterAddress(creator);
    try {
      const account = await (this.program.account as any).creatorEntityCounter // eslint-disable-line @typescript-eslint/no-explicit-any
        .fetch(counterAddress);
      return {
        creator: account.creator,
        entityCount: BigInt(account.entityCount.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch an entity account from the chain.
   *
   * @param entity - The entity PDA address
   * @returns The on-chain entity data, or `null` if the account does not exist
   */
  async fetchEntity(entity: PublicKey): Promise<EntityAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).entity.fetch(entity);
      return {
        creator: account.creator,
        index: BigInt(account.index.toString()),
        controller: account.controller,
        currentMetadataRevision: BigInt(
          account.currentMetadataRevision.toString(),
        ),
        createdAt: BigInt(account.createdAt.toString()),
        updatedAt: BigInt(account.updatedAt.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch an IP account from the chain.
   *
   * @param ip - The IP PDA address
   * @returns The on-chain IP data, or `null` if the account does not exist
   */
  async fetchIp(ip: PublicKey): Promise<IpAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).ipAccount.fetch(ip);
      return {
        contentHash: account.contentHash,
        registrantEntity: account.registrantEntity,
        currentOwnerEntity: account.currentOwnerEntity,
        currentMetadataRevision: BigInt(
          account.currentMetadataRevision.toString(),
        ),
        createdAt: BigInt(account.createdAt.toString()),
        updatedAt: BigInt(account.updatedAt.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch a derivative link account from the chain.
   *
   * @param derivativeLink - The derivative link PDA address
   * @returns The on-chain derivative link data, or `null` if the account does not exist
   */
  async fetchDerivativeLink(
    derivativeLink: PublicKey,
  ): Promise<DerivativeLinkAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).derivativeLink.fetch(
        derivativeLink,
      );
      return {
        parentIp: account.parentIp,
        childIp: account.childIp,
        license: account.license,
        createdAt: BigInt(account.createdAt.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch a metadata account from the chain.
   *
   * @param metadata - The metadata PDA address
   * @returns The on-chain metadata data, or `null` if the account does not exist
   */
  async fetchMetadata(metadata: PublicKey): Promise<MetadataAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).metadataAccount.fetch(
        metadata,
      );
      return {
        schema: account.schema,
        hash: account.hash,
        cid: account.cid,
        parentType: account.parentType,
        parent: account.parent,
        revision: BigInt(account.revision.toString()),
        createdAt: BigInt(account.createdAt.toString()),
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch a metadata schema account from the chain.
   *
   * @param schema - The metadata schema PDA address
   * @returns The on-chain schema data, or `null` if the account does not exist
   */
  async fetchMetadataSchema(
    schema: PublicKey,
  ): Promise<MetadataSchemaAccount | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (this.program.account as any).metadataSchema.fetch(
        schema,
      );
      return {
        id: account.id,
        version: account.version,
        hash: account.hash,
        cid: account.cid,
        creator: account.creator,
        createdAt: BigInt(account.createdAt.toString()),
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
   * Find all entity accounts matching the given filter.
   *
   * @param filter     - Optional filter by `creator`, `index`, and/or `controller`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findEntities(
    filter?: EntityFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<EntityAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).entity.all(
      buildEntityFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          creator: item.account.creator,
          index: BigInt(item.account.index.toString()),
          controller: item.account.controller,
          currentMetadataRevision: BigInt(
            item.account.currentMetadataRevision.toString(),
          ),
          createdAt: BigInt(item.account.createdAt.toString()),
          updatedAt: BigInt(item.account.updatedAt.toString()),
          bump: item.account.bump,
        } as EntityAccount,
      }),
    );
    return paginate(mapped, pagination);
  }

  /**
   * Find all IP accounts matching the given filter.
   *
   * @param filter     - Optional filter by `contentHash`, `registrantEntity`, and/or `currentOwnerEntity`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findIps(
    filter?: IpFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<IpAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).ipAccount.all(
      buildIpFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          contentHash: item.account.contentHash,
          registrantEntity: item.account.registrantEntity,
          currentOwnerEntity: item.account.currentOwnerEntity,
          currentMetadataRevision: BigInt(
            item.account.currentMetadataRevision.toString(),
          ),
          createdAt: BigInt(item.account.createdAt.toString()),
          updatedAt: BigInt(item.account.updatedAt.toString()),
          bump: item.account.bump,
        } as IpAccount,
      }),
    );
    return paginate(mapped, pagination);
  }

  /**
   * Find all derivative link accounts matching the given filter.
   *
   * @param filter     - Optional filter by `parentIp`, `childIp`, and/or `license`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findDerivativeLinks(
    filter?: DerivativeLinkFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<DerivativeLinkAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).derivativeLink.all(
      buildDerivativeLinkFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          parentIp: item.account.parentIp,
          childIp: item.account.childIp,
          license: item.account.license,
          createdAt: BigInt(item.account.createdAt.toString()),
          bump: item.account.bump,
        } as DerivativeLinkAccount,
      }),
    );
    return paginate(mapped, pagination);
  }

  /**
   * Find all metadata accounts matching the given filter.
   *
   * @param filter     - Optional filter by `parent` and/or `parentType`
   * @param pagination - Optional pagination (`limit` and `offset`)
   */
  async findMetadata(
    filter?: MetadataFilter,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<AccountWithPublicKey<MetadataAccount>>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (this.program.account as any).metadataAccount.all(
      buildMetadataFilters(filter),
    );
    const mapped = raw.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        publicKey: item.publicKey,
        account: {
          schema: item.account.schema,
          hash: item.account.hash,
          cid: item.account.cid,
          parentType: item.account.parentType,
          parent: item.account.parent,
          revision: BigInt(item.account.revision.toString()),
          createdAt: BigInt(item.account.createdAt.toString()),
          bump: item.account.bump,
        } as MetadataAccount,
      }),
    );
    return paginate(mapped, pagination);
  }
}
