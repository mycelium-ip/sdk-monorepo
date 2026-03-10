import type { Wallet } from "@wallet-standard/base";

/**
 * Structural type guard that checks whether an unknown value satisfies the
 * {@link Wallet} interface from the Wallet Standard.
 */
export function isStandardWallet(value: unknown): value is Wallet {
  if (value === null || typeof value !== "object") return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.version === "string" &&
    typeof w.name === "string" &&
    typeof w.icon === "string" &&
    Array.isArray(w.chains) &&
    Array.isArray(w.accounts) &&
    typeof w.features === "object" &&
    w.features !== null
  );
}

/**
 * Check whether a Wallet Standard wallet exposes a given feature identifier.
 */
export function walletSupportsFeature(
  wallet: Wallet,
  feature: string,
): boolean {
  return feature in wallet.features;
}
