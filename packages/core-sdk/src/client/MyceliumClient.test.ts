import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { describe, expect, it, vi } from "vitest";
import { getProgramIds } from "../constants/programs";
import { UnsupportedFeatureError } from "../wallet/errors";
import { sha256Hash, utf8Bytes } from "../utils/bytes";
import { MyceliumClient } from "./MyceliumClient";

function createTestWallet(publicKey?: PublicKey): Wallet {
  const pk = publicKey ?? Keypair.generate().publicKey;
  const account: WalletAccount = {
    address: pk.toBase58(),
    publicKey: pk.toBytes(),
    chains: ["solana:devnet"],
    features: ["solana:signTransaction", "solana:signMessage"],
  };
  return {
    version: "1.0.0" as const,
    name: "Test Wallet",
    icon: "data:image/svg+xml;base64," as `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`,
    chains: ["solana:devnet"],
    accounts: [account],
    features: {
      "solana:signTransaction": {
        version: "1.0.0" as const,
        supportedTransactionVersions: ["legacy" as const, 0 as const],
        signTransaction: vi
          .fn()
          .mockResolvedValue([
            { signedTransaction: new Uint8Array([1, 2, 3]) },
          ]),
      },
      "solana:signMessage": {
        version: "1.0.0" as const,
        signMessage: vi.fn().mockResolvedValue([
          {
            signedMessage: new Uint8Array(32),
            signature: new Uint8Array(64),
          },
        ]),
      },
    },
  };
}

describe("MyceliumClient smoke", () => {
  it("builds instructions from each module", async () => {
    const wallet = createTestWallet();

    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet,
    });

    const entityIx = await client.ipCore.entity.createIx({});

    const schemaIx = await client.ipCore.metadata.createSchemaIx({
      id: "default-schema",
      version: "v1",
      dataHash: sha256Hash(utf8Bytes("schema-content")),
      cid: "cid://schema",
    });

    const registrantEntity = Keypair.generate().publicKey;
    const payerTokenAccount = Keypair.generate().publicKey;
    const treasuryTokenAccount = Keypair.generate().publicKey;
    const createIpIx = await client.ipCore.ip.createIx({
      registrantEntity,
      contentHash: new Uint8Array(32).fill(1), // 32-byte mock hash
      payerTokenAccount,
      treasuryTokenAccount,
    });

    const originIp = Keypair.generate().publicKey;
    const ownerEntity = Keypair.generate().publicKey;
    const licenseIx = await client.license.license.createIx({
      originIp,
      ownerEntity,
      derivativesAllowed: true,
    });

    const grantIx = await client.license.grant.createIx({
      originIp,
      authorityEntity: ownerEntity,
      granteeEntity: Keypair.generate().publicKey,
      expiration: 0,
    });

    const derivativeIx = await client.ipCore.derivative.createIx({
      parentIp: Keypair.generate().publicKey,
      childIp: Keypair.generate().publicKey,
      childOwnerEntity: ownerEntity,
      licenseGrant: Keypair.generate().publicKey,
      license: Keypair.generate().publicKey,
    });

    expect(entityIx.keys.length).toBeGreaterThan(0);
    expect(schemaIx.keys.length).toBeGreaterThan(0);
    expect(createIpIx.keys.length).toBeGreaterThan(0);
    expect(licenseIx.keys.length).toBeGreaterThan(0);
    expect(grantIx.keys.length).toBeGreaterThan(0);
    expect(derivativeIx.keys.length).toBeGreaterThan(0);
  });
});

describe("MyceliumClient cluster", () => {
  it("defaults to devnet program IDs", () => {
    const wallet = createTestWallet();

    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet,
    });

    const devnetIds = getProgramIds("devnet");
    expect(client.ipCore.program.programId.toBase58()).toBe(
      devnetIds.ipCore.toBase58(),
    );
    expect(client.license.program.programId.toBase58()).toBe(
      devnetIds.license.toBase58(),
    );
  });

  it("uses mainnet-beta program IDs when cluster is mainnet-beta", () => {
    const wallet = createTestWallet();

    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet,
      cluster: "mainnet-beta",
    });

    const mainnetIds = getProgramIds("mainnet-beta");
    expect(client.ipCore.program.programId.toBase58()).toBe(
      mainnetIds.ipCore.toBase58(),
    );
    expect(client.license.program.programId.toBase58()).toBe(
      mainnetIds.license.toBase58(),
    );
  });
});

describe("MyceliumClient.setWallet", () => {
  it("updates wallet.publicKey to match the new wallet", () => {
    const wallet1 = createTestWallet();
    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet: wallet1,
    });
    const originalPk = client.wallet.publicKey;

    const newPk = Keypair.generate().publicKey;
    const wallet2 = createTestWallet(newPk);
    client.setWallet(wallet2);

    expect(client.wallet.publicKey.toBase58()).toBe(newPk.toBase58());
    expect(client.wallet.publicKey.toBase58()).not.toBe(originalPk.toBase58());
  });

  it("propagates through provider.wallet to modules", () => {
    const wallet1 = createTestWallet();
    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet: wallet1,
    });

    const newPk = Keypair.generate().publicKey;
    client.setWallet(createTestWallet(newPk));

    // The provider's wallet reference is the same StandardWalletWrapper object,
    // so its publicKey should reflect the new wallet.
    expect(client.ipCore.provider.wallet.publicKey.toBase58()).toBe(
      newPk.toBase58(),
    );
    expect(client.license.provider.wallet.publicKey.toBase58()).toBe(
      newPk.toBase58(),
    );
  });

  it("uses the new wallet as default signer for createIx", async () => {
    const wallet1 = createTestWallet();
    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet: wallet1,
    });

    const newPk = Keypair.generate().publicKey;
    client.setWallet(createTestWallet(newPk));

    const entityIx = await client.ipCore.entity.createIx({});

    // The creator account (first writable signer) should be the new pubkey
    const signerKey = entityIx.keys.find((k) => k.isSigner);
    expect(signerKey?.pubkey.toBase58()).toBe(newPk.toBase58());
  });

  it("throws UnsupportedFeatureError for wallet without signTransaction", () => {
    const wallet1 = createTestWallet();
    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet: wallet1,
    });

    const badWallet: Wallet = {
      version: "1.0.0" as const,
      name: "Bad Wallet",
      icon: "data:image/svg+xml;base64," as `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`,
      chains: ["solana:devnet"],
      accounts: [
        {
          address: Keypair.generate().publicKey.toBase58(),
          publicKey: Keypair.generate().publicKey.toBytes(),
          chains: ["solana:devnet"],
          features: [],
        },
      ],
      features: {},
    };

    expect(() => client.setWallet(badWallet)).toThrow(UnsupportedFeatureError);
  });

  it("throws when wallet has no accounts", () => {
    const wallet1 = createTestWallet();
    const client = new MyceliumClient({
      connection: new Connection("http://localhost:8899", "processed"),
      wallet: wallet1,
    });

    const emptyWallet: Wallet = {
      version: "1.0.0" as const,
      name: "Empty Wallet",
      icon: "data:image/svg+xml;base64," as `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`,
      chains: ["solana:devnet"],
      accounts: [],
      features: {
        "solana:signTransaction": {
          version: "1.0.0" as const,
          supportedTransactionVersions: ["legacy" as const],
          signTransaction: vi.fn(),
        },
      },
    };

    expect(() => client.setWallet(emptyWallet)).toThrow(
      /no account at index 0/,
    );
  });
});
