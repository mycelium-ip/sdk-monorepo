"use client";

import { useContext } from "react";
import {
  MyceliumContext,
  type MyceliumContextValue,
} from "../../provider/context";

/**
 * Returns the full Mycelium context value.
 *
 * `wallet` and `client` may be `null` when the wallet is not yet connected.
 * Mutation hooks guard against this by throwing "Wallet not connected" at call time.
 *
 * @throws Error if used outside of MyceliumIpProvider
 *
 * @example
 * ```ts
 * const { connection, wallet, client, confirmation } = useMyceliumContext();
 * ```
 */
export function useMyceliumContext(): MyceliumContextValue {
  const context = useContext(MyceliumContext);

  if (context === null) {
    throw new Error(
      "useMyceliumContext must be used within a MyceliumIpProvider. " +
        "Make sure your component is wrapped with <MyceliumIpProvider>.",
    );
  }

  return context;
}
