// This file defines the entire public SDK surface.
// Do not export internal modules directly.

import { sdkVersion } from "@mycelium/core-sdk";

export function reactVersion() {
  return sdkVersion();
}
