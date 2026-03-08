import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds } from "../../constants/programs";
import type { MyceliumCluster } from "../../types";
import { parseTransactionEvents } from "../../utils/events";
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
   * React hooks use this as an `eventParser` callback so the React package
   * does not need a direct dependency on `@coral-xyz/anchor`.
   *
   * @param connection - Solana RPC connection
   * @param signature  - Transaction signature
   */
  async parseEvent<E>(connection: Connection, signature: string): Promise<E> {
    const events = await parseTransactionEvents<E>(
      connection,
      signature,
      this.program,
    );
    return events[0] as E;
  }
}
