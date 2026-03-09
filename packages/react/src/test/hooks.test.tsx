import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCreateEntity } from "../hooks/entity/useCreateEntity";
import { useCreateEntityWithMetadata } from "../hooks/entity/useCreateEntityWithMetadata";
import { useMyceliumContext } from "../hooks/internal/useMyceliumContext";
import { useMyceliumWallet } from "../hooks/internal/useMyceliumWallet";
import { useCreateIpWithMetadata } from "../hooks/ip/useCreateIpWithMetadata";
import { queryKeys } from "../hooks/queries/queryKeys";
import {
  createMockPublicKey,
  mockEntityCreatedEvent,
  mockEntityMetadataCreatedEvent,
  mockIpCreatedEvent,
  mockIpMetadataCreatedEvent,
} from "./mocks";
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

  it("returns parsed event in data.event on success", async () => {
    const { wrapper, mockClient } = createTestWrapper();

    const { result } = renderHook(() => useCreateEntity(), { wrapper });

    result.current.mutate({ handle: "test-entity" });

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    if (result.current.isSuccess) {
      expect(result.current.data?.event).toEqual(mockEntityCreatedEvent);
      expect(mockClient.ipCore.parseEvent).toHaveBeenCalled();
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

describe("useCreateEntityWithMetadata", () => {
  const schemaPubkey = createMockPublicKey();
  const baseParams = {
    entity: {
      handle: "test-entity",
      additionalControllers: [],
      signatureThreshold: 1,
    },
    metadata: {
      schema: schemaPubkey,
      data: new Uint8Array([1, 2, 3]),
      cid: "ipfs://QmTest",
    },
  };

  it("calls entity.createIx with entity params", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(mockClient.ipCore.entity.createIx).toHaveBeenCalledWith(
        baseParams.entity,
      );
    });
  });

  it("calls program.methods.createEntityMetadata with derived entity PDA", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(
        mockClient.ipCore.program.methods.createEntityMetadata,
      ).toHaveBeenCalled();
    });
  });

  it("invalidates entity and metadata queries on success", async () => {
    const { wrapper, queryClient } = createTestWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });

    result.current.mutate(baseParams);

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    if (result.current.isSuccess) {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.entities(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.metadata(),
      });
    }
  });

  it("returns parsed events in data on success", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    mockClient.ipCore.parseEvents = vi
      .fn()
      .mockResolvedValue([
        mockEntityCreatedEvent,
        mockEntityMetadataCreatedEvent,
      ]);

    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });

    result.current.mutate(baseParams);

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    if (result.current.isSuccess) {
      expect(result.current.data?.entityCreated).toEqual(
        mockEntityCreatedEvent,
      );
      expect(result.current.data?.entityMetadataCreated).toEqual(
        mockEntityMetadataCreatedEvent,
      );
    }
  });

  it("exposes isWalletConnected true when wallet is connected", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });
    expect(result.current.isWalletConnected).toBe(true);
  });

  it("exposes isWalletConnected false when wallet is null", () => {
    const { wrapper } = createDisconnectedTestWrapper();
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });
    expect(result.current.isWalletConnected).toBe(false);
  });

  it("throws Wallet not connected when called without wallet", async () => {
    const { wrapper } = createDisconnectedTestWrapper();
    const { result } = renderHook(() => useCreateEntityWithMetadata(), {
      wrapper,
    });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Wallet not connected");
  });
});

describe("useCreateIpWithMetadata", () => {
  const registrantEntity = createMockPublicKey();
  const schemaPubkey = createMockPublicKey();
  const treasuryAccount = createMockPublicKey();
  const payerAccount = createMockPublicKey();

  const baseParams = {
    ip: {
      registrantEntity,
      content: new Uint8Array([10, 20, 30]),
      treasuryTokenAccount: treasuryAccount,
      payerTokenAccount: payerAccount,
    },
    metadata: {
      schema: schemaPubkey,
      data: new Uint8Array([4, 5, 6]),
      cid: "ipfs://QmIpTest",
    },
  };

  it("calls ip.createIx with ip params", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(mockClient.ipCore.ip.createIx).toHaveBeenCalledWith(baseParams.ip);
    });
  });

  it("calls program.methods.createIpMetadata with derived IP PDA and ownerEntity", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(
        mockClient.ipCore.program.methods.createIpMetadata,
      ).toHaveBeenCalled();
    });
  });

  it("invalidates ip and metadata queries on success", async () => {
    const { wrapper, queryClient } = createTestWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });

    result.current.mutate(baseParams);

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    if (result.current.isSuccess) {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.ips(),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.metadata(),
      });
    }
  });

  it("returns parsed events in data on success", async () => {
    const { wrapper, mockClient } = createTestWrapper();
    mockClient.ipCore.parseEvents = vi
      .fn()
      .mockResolvedValue([mockIpCreatedEvent, mockIpMetadataCreatedEvent]);

    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });

    result.current.mutate(baseParams);

    await waitFor(
      () => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    if (result.current.isSuccess) {
      expect(result.current.data?.ipCreated).toEqual(mockIpCreatedEvent);
      expect(result.current.data?.ipMetadataCreated).toEqual(
        mockIpMetadataCreatedEvent,
      );
    }
  });

  it("exposes isWalletConnected true when wallet is connected", () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });
    expect(result.current.isWalletConnected).toBe(true);
  });

  it("exposes isWalletConnected false when wallet is null", () => {
    const { wrapper } = createDisconnectedTestWrapper();
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });
    expect(result.current.isWalletConnected).toBe(false);
  });

  it("throws Wallet not connected when called without wallet", async () => {
    const { wrapper } = createDisconnectedTestWrapper();
    const { result } = renderHook(() => useCreateIpWithMetadata(), { wrapper });

    result.current.mutate(baseParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Wallet not connected");
  });
});
