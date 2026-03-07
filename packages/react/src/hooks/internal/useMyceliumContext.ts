"use client";

import { useContext } from "react";
import {
  MyceliumContext,
  type MyceliumContextValue,
} from "../../provider/context";

/**
 * Returns the full Mycelium context value.
 *
 * @throws Error if used outside of MyceliumIpProvider
 * @throws Error if wallet is not connected (no publicKey)
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
