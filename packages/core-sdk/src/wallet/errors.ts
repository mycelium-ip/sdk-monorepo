/**
 * Thrown when a Wallet Standard feature required by the SDK is not supported
 * by the provided wallet.
 */
export class UnsupportedFeatureError extends Error {
  /** The identifier of the missing feature (e.g. `"solana:signMessage"`). */
  readonly feature: string;

  constructor(feature: string) {
    super(`Wallet does not support the required feature: ${feature}`);
    this.name = "UnsupportedFeatureError";
    this.feature = feature;
  }
}
