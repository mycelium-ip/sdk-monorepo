import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  MyceliumContext,
  type MyceliumContextValue,
} from "../provider/context";
import {
  createMockConnection,
  createMockMyceliumClient,
  createMockWallet,
} from "./mocks";

interface TestWrapperOptions {
  contextValue?: Partial<MyceliumContextValue>;
}

/**
 * Creates a test wrapper with mocked context and query client.
 */
export function createTestWrapper(options: TestWrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const mockConnection = createMockConnection();
  const mockWallet = createMockWallet();
  const mockClient = createMockMyceliumClient();

  const contextValue: MyceliumContextValue = {
    connection: mockConnection,
    wallet: mockWallet,
    client: mockClient,
    confirmation: "confirmed",
    ...options.contextValue,
  };

  function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MyceliumContext.Provider value={contextValue}>
          {children}
        </MyceliumContext.Provider>
      </QueryClientProvider>
    );
  }

  return {
    wrapper: TestWrapper,
    queryClient,
    mockConnection,
    mockWallet,
    mockClient,
    contextValue,
  };
}
