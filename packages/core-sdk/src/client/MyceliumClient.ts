import { IpCoreClient } from "../programs/ipCore/IpCoreClient";
import { LicenseClient } from "../programs/license/LicenseClient";
import type { MyceliumClientOptions } from "../types";
import { createProvider } from "../utils/provider";
import { StandardWalletWrapper } from "../wallet";

export class MyceliumClient {
  readonly wallet: StandardWalletWrapper;
  readonly ipCore: IpCoreClient;
  readonly license: LicenseClient;

  constructor(options: MyceliumClientOptions) {
    const cluster = options.cluster ?? "devnet";

    this.wallet = new StandardWalletWrapper(options.wallet);

    const provider = createProvider(
      options.connection,
      this.wallet,
      options.confirmOptions,
    );

    this.ipCore = new IpCoreClient(provider, cluster);
    this.license = new LicenseClient(provider, cluster);
  }
}
