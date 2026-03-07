import type { MyceliumClient } from "@mycelium-ip/core-sdk";
import {
  type Connection,
  Keypair,
  type PublicKey,
  type Transaction,
} from "@solana/web3.js";
import { vi } from "vitest";
import type { MyceliumWallet } from "../types/wallet";

/**
 * Creates a mock Solana Connection.
 */
export function createMockConnection(): Connection {
  return {
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: "mockBlockhash123",
      lastValidBlockHeight: 12345,
    }),
    sendRawTransaction: vi.fn().mockResolvedValue("mockSignature123"),
    confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    commitment: "confirmed",
  } as unknown as Connection;
}

/**
 * Creates a mock wallet.
 */
export function createMockWallet(publicKey?: PublicKey): MyceliumWallet {
  const keypair = Keypair.generate();
  const pk = publicKey ?? keypair.publicKey;

  return {
    publicKey: pk,
    signTransaction: vi.fn().mockImplementation(async (tx) => {
      // Return a mock transaction with the required methods
      const mockTx = Object.create(tx);
      mockTx.serialize = () => Buffer.from([1, 2, 3]);
      return mockTx;
    }),
    signAllTransactions: vi.fn().mockImplementation(async (txs) => {
      return txs.map((tx: Transaction) => {
        const mockTx = Object.create(tx);
        mockTx.serialize = () => Buffer.from([1, 2, 3]);
        return mockTx;
      });
    }),
    signMessage: vi.fn().mockResolvedValue(new Uint8Array(64)),
  };
}

/**
 * Creates a mock instruction.
 */
export function createMockInstruction() {
  return {
    programId: Keypair.generate().publicKey,
    keys: [],
    data: Buffer.from([]),
  };
}

/**
 * Creates a mock IpCore entity module.
 */
function createMockEntityModule() {
  return {
    createIx: vi.fn().mockResolvedValue(createMockInstruction()),
    create: vi.fn().mockResolvedValue("mockSignature"),
    updateControllersIx: vi.fn().mockResolvedValue(createMockInstruction()),
    updateControllers: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock IpCore IP module.
 */
function createMockIpModule() {
  return {
    createIx: vi.fn().mockResolvedValue(createMockInstruction()),
    create: vi.fn().mockResolvedValue("mockSignature"),
    transferIx: vi.fn().mockResolvedValue(createMockInstruction()),
    transfer: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock IpCore metadata module.
 */
function createMockMetadataModule() {
  return {
    createSchemaIx: vi.fn().mockResolvedValue(createMockInstruction()),
    createSchema: vi.fn().mockResolvedValue("mockSignature"),
    createEntityMetadataIx: vi.fn().mockResolvedValue(createMockInstruction()),
    createEntityMetadata: vi.fn().mockResolvedValue("mockSignature"),
    createIpMetadataIx: vi.fn().mockResolvedValue(createMockInstruction()),
    createIpMetadata: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock IpCore derivative module.
 */
function createMockDerivativeModule() {
  return {
    createIx: vi.fn().mockResolvedValue(createMockInstruction()),
    create: vi.fn().mockResolvedValue("mockSignature"),
    updateLicenseIx: vi.fn().mockResolvedValue(createMockInstruction()),
    updateLicense: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock License license module.
 */
function createMockLicenseModule() {
  return {
    createIx: vi.fn().mockResolvedValue(createMockInstruction()),
    create: vi.fn().mockResolvedValue("mockSignature"),
    updateIx: vi.fn().mockResolvedValue(createMockInstruction()),
    update: vi.fn().mockResolvedValue("mockSignature"),
    revokeIx: vi.fn().mockResolvedValue(createMockInstruction()),
    revoke: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock License grant module.
 */
function createMockGrantModule() {
  return {
    createIx: vi.fn().mockResolvedValue(createMockInstruction()),
    create: vi.fn().mockResolvedValue("mockSignature"),
    revokeIx: vi.fn().mockResolvedValue(createMockInstruction()),
    revoke: vi.fn().mockResolvedValue("mockSignature"),
  };
}

/**
 * Creates a mock MyceliumClient.
 */
export function createMockMyceliumClient(): MyceliumClient {
  return {
    ipCore: {
      entity: createMockEntityModule(),
      ip: createMockIpModule(),
      metadata: createMockMetadataModule(),
      derivative: createMockDerivativeModule(),
    },
    license: {
      license: createMockLicenseModule(),
      grant: createMockGrantModule(),
    },
  } as unknown as MyceliumClient;
}

/**
 * Helper to create test params with mocked public keys.
 */
export function createMockPublicKey(): PublicKey {
  return Keypair.generate().publicKey;
}
