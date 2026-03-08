"use client";

import { MyceliumClient, type MyceliumCluster } from "@mycelium-ip/core-sdk";
import type { Commitment, Connection } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useMemo } from "react";
import type { MyceliumWallet } from "../types/wallet";
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
   * Enable TanStack Query devtools.
   * @default true in development, false in production
   */
  devtools?: boolean;

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

  /** Wallet implementing the MyceliumWallet interface (optional; mutations will throw when null/undefined) */
  wallet?: MyceliumWallet | null;

  /**
   * Existing TanStack Query client.
   * If omitted, the provider creates one.
   */
  queryClient?: QueryClient;

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
  options,
  children,
}: MyceliumIpProviderProps) {
  const confirmation = options?.confirmation ?? "confirmed";
  const showDevtools = options?.devtools ?? false;
  const cluster: MyceliumCluster = options?.cluster ?? "devnet";

  // Create a default query client if none provided
  const resolvedQueryClient = useMemo(
    () => queryClient ?? createDefaultQueryClient(),
    [queryClient],
  );

  // Create the core SDK client
  const client = useMemo(() => {
    // Only create client if wallet exists and has a public key
    if (!wallet?.publicKey) {
      return null;
    }

    return new MyceliumClient({
      connection,
      wallet: {
        publicKey: wallet.publicKey,
        signTransaction: (tx) => wallet.signTransaction(tx),
        signAllTransactions:
          wallet.signAllTransactions ??
          (async (txs) => {
            const signed = [];
            for (const tx of txs) {
              signed.push(await wallet.signTransaction(tx));
            }
            return signed;
          }),
        signMessage: wallet.signMessage,
      },
      cluster,
    });
  }, [connection, wallet, cluster]);

  // Create context value — always non-null inside the provider;
  // wallet and client are null when the wallet is not yet connected.
  const contextValue = useMemo<MyceliumContextValue>(() => {
    return {
      connection,
      wallet: wallet ?? null,
      client,
      confirmation,
      cluster,
    };
  }, [connection, wallet, client, confirmation, cluster]);

  return (
    <QueryClientProvider client={resolvedQueryClient}>
      <MyceliumContext.Provider value={contextValue}>
        {children}
      </MyceliumContext.Provider>
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
