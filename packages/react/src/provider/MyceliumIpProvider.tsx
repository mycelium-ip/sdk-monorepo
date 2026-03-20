"use client";

import { MyceliumClient, type MyceliumCluster } from "@mycelium-ip/core-sdk";
import type { Wallet } from "@wallet-standard/base";
import type { Commitment, Connection } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useMemo, useRef } from "react";
import type { TransactionExecutor } from "../types";
import { MyceliumContext, type MyceliumContextValue } from "./context";

/**
 * Options for the MyceliumIpProvider.
 */
export interface MyceliumIpProviderOptions {
  /**
   * Transaction confirmation level.
   * @default "confirmed"
   */
  confirmation?: Commitment;

  /**
   * Target Solana cluster. Determines which program IDs are used.
   * @default 'devnet'
   */
  cluster?: MyceliumCluster;
}

/**
 * Props for the MyceliumIpProvider component.
 */
export interface MyceliumIpProviderProps {
  /** Solana RPC connection (required) */
  connection: Connection;

  /** Wallet Standard–compliant wallet (optional; mutations will throw when null/undefined) */
  wallet?: Wallet | null;

  /**
   * Existing TanStack Query client.
   * If omitted, the provider creates one.
   */
  queryClient?: QueryClient;

  /**
   * Custom transaction executor that replaces the default wallet sign → send
   * flow. When provided, all mutation hooks will delegate to this function
   * instead of using the wallet adapter to sign and send.
   *
   * The function receives a fully-built unsigned `Transaction` and must return
   * `{ signature }`. The SDK still handles confirmation and event parsing.
   *
   * @example
   * ```tsx
   * // Privy sponsored transaction
   * const { signAndSendTransaction } = useSignAndSendTransaction();
   *
   * <MyceliumIpProvider
   *   executeTransaction={async (tx) => {
   *     const { hash } = await signAndSendTransaction({
   *       transaction: tx,
   *       options: { sponsor: true },
   *     });
   *     return { signature: hash };
   *   }}
   *   // ...
   * />
   * ```
   */
  executeTransaction?: TransactionExecutor;

  /** Provider options */
  options?: MyceliumIpProviderOptions;

  /** Child components */
  children: ReactNode;
}

// Default query client with sensible defaults
const createDefaultQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  });

/**
 * Provider component for the Mycelium React SDK.
 *
 * Initializes the core SDK client and provides it via React context.
 * Also wraps children with TanStack Query's QueryClientProvider.
 *
 * @example
 * ```tsx
 * <MyceliumIpProvider
 *   connection={connection}
 *   wallet={wallet}
 *   options={{ confirmation: "confirmed" }}
 * >
 *   <App />
 * </MyceliumIpProvider>
 * ```
 */
export function MyceliumIpProvider({
  connection,
  wallet,
  queryClient,
  executeTransaction,
  options,
  children,
}: MyceliumIpProviderProps) {
  const confirmation = options?.confirmation ?? "confirmed";
  const cluster: MyceliumCluster = options?.cluster ?? "devnet";

  // Create a default query client if none provided
  const resolvedQueryClient = useMemo(
    () => queryClient ?? createDefaultQueryClient(),
    [queryClient],
  );

  // Stable client ref — avoids full reconstruction on wallet-only changes.
  // Tracks the connection + cluster the client was built with so we know when
  // a full rebuild (vs. a wallet swap) is needed.
  const clientRef = useRef<MyceliumClient | null>(null);
  const builtWithRef = useRef<{
    connection: Connection;
    cluster: MyceliumCluster;
  } | null>(null);

  // Reconcile: rebuild only when connection/cluster change; otherwise swap wallet in-place.
  const client = useMemo(() => {
    const hasWallet = wallet && wallet.accounts.length > 0;

    if (!hasWallet) {
      clientRef.current = null;
      builtWithRef.current = null;
      return null;
    }

    const needsRebuild =
      !clientRef.current ||
      builtWithRef.current?.connection !== connection ||
      builtWithRef.current?.cluster !== cluster;

    if (needsRebuild) {
      clientRef.current = new MyceliumClient({
        connection,
        wallet,
        cluster,
      });
      builtWithRef.current = { connection, cluster };
    } else {
      // Same connection + cluster — swap the wallet in-place.
      clientRef.current!.setWallet(wallet);
    }

    return clientRef.current;
  }, [connection, wallet, cluster]);

  // Create context value — always non-null inside the provider;
  // wallet and client are null when the wallet is not yet connected.
  const contextValue = useMemo<MyceliumContextValue>(() => {
    return {
      connection,
      wallet: client?.wallet ?? null,
      client,
      confirmation,
      cluster,
      executeTransaction,
    };
  }, [connection, client, confirmation, cluster, executeTransaction]);

  return (
    <QueryClientProvider client={resolvedQueryClient}>
      <MyceliumContext.Provider value={contextValue}>
        {children}
      </MyceliumContext.Provider>
    </QueryClientProvider>
  );
}
