import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds, PDA_SEEDS } from "../../constants/programs";
import { deriveEntityPda } from "../../pda/entity";
import { deriveIpPda } from "../../pda/ip";
import {
  deriveEntityMetadataPda,
  deriveIpMetadataPda,
} from "../../pda/metadata";
import type {
  MyceliumCluster,
  ProtocolConfig,
  StringOrBytes,
} from "../../types";
import { utf8Bytes } from "../../utils/bytes";
import {
  findEventByName,
  parseTransactionEvents,
  type ParsedEvent,
} from "../../utils/events";
import { DerivativeModule } from "./derivative";
import { EntityModule } from "./entity";
import { IpModule } from "./ip";
import { MetadataModule } from "./metadata";

export class IpCoreClient {
  readonly provider: AnchorProvider;
  readonly program: Program;
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
    this.program = new Program(idls.ipCore, provider);

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
   * Derive the entity PDA for the given creator and handle.
   *
   * Useful when you need the entity address before the entity has been created
   * on-chain, e.g. to populate subsequent instructions in the same transaction.
   *
   * @param creator - The creator public key
   * @param handle  - The entity handle (string or bytes)
   */
  deriveEntityAddress(creator: PublicKey, handle: StringOrBytes): PublicKey {
    const [pda] = deriveEntityPda(creator, handle, this.program.programId);
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
}
