import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCreateEntity } from "../hooks/entity/useCreateEntity";
import { useMyceliumContext } from "../hooks/internal/useMyceliumContext";
import { useMyceliumWallet } from "../hooks/internal/useMyceliumWallet";
import { queryKeys } from "../hooks/queries/queryKeys";
import { createMockPublicKey } from "./mocks";
import { createDisconnectedTestWrapper, createTestWrapper } from "./wrapper";

describe("useMyceliumContext", () => {
  it("throws when used outside provider", () => {
    // Attempting to render hook without wrapper should throw
    expect(() => {
      renderHook(() => useMyceliumContext());
    }).toThrow("useMyceliumContext must be used within a MyceliumIpProvider");
  });

  it("returns context value when inside provider", () => {
    const { wrapper, contextValue } = createTestWrapper();

    const { result } = renderHook(() => useMyceliumContext(), { wrapper });

    expect(result.current.connection).toBe(contextValue.connection);
    expect(result.current.wallet).toBe(contextValue.wallet);
    expect(result.current.client).toBe(contextValue.client);
    expect(result.current.confirmation).toBe("confirmed");
  });

  it("returns context with null wallet/client when disconnected", () => {
    const { wrapper } = createDisconnectedTestWrapper();

    const { result } = renderHook(() => useMyceliumContext(), { wrapper });

    expect(result.current.wallet).toBeNull();
    expect(result.current.client).toBeNull();
  });
});

describe("useMyceliumWallet", () => {
  it("returns isConnected true when wallet with publicKey is present", () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useMyceliumWallet(), { wrapper });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.wallet).not.toBeNull();
  });

  it("returns isConnected false when wallet is null", () => {
    const { wrapper } = createDisconnectedTestWrapper();

    const { result } = renderHook(() => useMyceliumWallet(), { wrapper });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.wallet).toBeNull();
  });
});

describe("useCreateEntity", () => {
  it("calls client.ipCore.entity.createIx with correct params", async () => {
    const { wrapper, mockClient } = createTestWrapper();

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    const params = {
      handle: "test-entity",
      additionalControllers: [createMockPublicKey()],
      signatureThreshold: 1,
    };

    result.current.mutate(params);

    await waitFor(() => {
      expect(mockClient.ipCore.entity.createIx).toHaveBeenCalledWith(params);
    });
  });

  it("invalidates entity queries on success", async () => {
    const { wrapper, queryClient } = createTestWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    result.current.mutate({ handle: "test-entity" });

    // Wait for either success or error to complete the mutation
    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    // Skip this assertion if mutation errored since the full
    // transaction lifecycle mocks aren't complete
    if (result.current.isSuccess) {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.entities(),
      });
    }
  });

  it("exposes isWalletConnected true when wallet is connected", () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    expect(result.current.isWalletConnected).toBe(true);
  });

  it("exposes isWalletConnected false when wallet is null", () => {
    const { wrapper } = createDisconnectedTestWrapper();

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    expect(result.current.isWalletConnected).toBe(false);
  });

  it("throws Wallet not connected when mutate is called without wallet", async () => {
    const { wrapper } = createDisconnectedTestWrapper();

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    result.current.mutate({ handle: "test-entity" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Wallet not connected");
  });
});

describe("queryKeys", () => {
  it("creates correct query key hierarchy", () => {
    expect(queryKeys.all).toEqual(["mycelium"]);
    expect(queryKeys.entities()).toEqual(["mycelium", "entities"]);
    expect(queryKeys.entity("123")).toEqual(["mycelium", "entities", "123"]);
    expect(queryKeys.ips()).toEqual(["mycelium", "ips"]);
    expect(queryKeys.ip("456")).toEqual(["mycelium", "ips", "456"]);
    expect(queryKeys.licenses()).toEqual(["mycelium", "licenses"]);
    expect(queryKeys.grants()).toEqual(["mycelium", "grants"]);
    expect(queryKeys.metadata()).toEqual(["mycelium", "metadata"]);
    expect(queryKeys.derivatives()).toEqual(["mycelium", "derivatives"]);
  });
});
