import { IpCoreClient } from "../programs/ipCore/IpCoreClient";
import { LicenseClient } from "../programs/license/LicenseClient";
import type { MyceliumClientOptions } from "../types";
import { createProvider } from "../utils/provider";

export class MyceliumClient {
  readonly ipCore: IpCoreClient;
  readonly license: LicenseClient;

  constructor(options: MyceliumClientOptions) {
    const cluster = options.cluster ?? "devnet";

    const provider = createProvider(
      options.connection,
      options.wallet,
      options.confirmOptions,
    );

    this.ipCore = new IpCoreClient(provider, cluster);
    this.license = new LicenseClient(provider, cluster);
  }
}
