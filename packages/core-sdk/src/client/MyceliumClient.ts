import type { AnchorProvider } from "@coral-xyz/anchor";
import type { Wallet } from "@wallet-standard/base";
import { IpCoreClient } from "../programs/ipCore/IpCoreClient";
import { LicenseClient } from "../programs/license/LicenseClient";
import type { MyceliumClientOptions } from "../types";
import { createProvider } from "../utils/provider";
import { StandardWalletWrapper } from "../wallet";

export class MyceliumClient {
  readonly wallet: StandardWalletWrapper;
  readonly ipCore: IpCoreClient;
  readonly license: LicenseClient;
  private readonly provider: AnchorProvider;

  constructor(options: MyceliumClientOptions) {
    const cluster = options.cluster ?? "devnet";

    this.wallet = new StandardWalletWrapper(options.wallet);

    this.provider = createProvider(
      options.connection,
      this.wallet,
      options.confirmOptions,
    );

    this.ipCore = new IpCoreClient(this.provider, cluster);
    this.license = new LicenseClient(this.provider, cluster);
  }

  /**
   * Switch the active wallet without reconstructing the provider or programs.
   *
   * Mutates the existing `StandardWalletWrapper` in-place so the change
   * propagates through `AnchorProvider → Program → Modules` automatically.
   */
  setWallet(wallet: Wallet, accountIndex?: number): void {
    this.wallet.setWallet(wallet, accountIndex);

    // AnchorProvider caches `publicKey` at construction; force-sync it.
    (
      this.provider as unknown as { publicKey: typeof this.wallet.publicKey }
    ).publicKey = this.wallet.publicKey;
  }
}
