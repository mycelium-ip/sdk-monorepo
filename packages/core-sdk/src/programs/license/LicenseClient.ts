import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds } from "../../constants/programs";
import type { MyceliumCluster } from "../../types";
import { parseTransactionEvents } from "../../utils/events";
import { GrantModule } from "./grant";
import { LicenseModule } from "./license";

export class LicenseClient {
  readonly provider: AnchorProvider;
  readonly program: Program;
  readonly ipCoreProgramId: PublicKey;

  readonly license: LicenseModule;
  readonly grant: GrantModule;

  constructor(provider: AnchorProvider, cluster: MyceliumCluster = "devnet") {
    const programIds = getProgramIds(cluster);
    const idls = getIdls(cluster);

    this.ipCoreProgramId = programIds.ipCore;
    this.provider = provider;
    this.program = new Program(idls.license, provider);

    this.license = new LicenseModule(this);
    this.grant = new GrantModule(this);
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
