import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { describe, expect, it, vi } from "vitest";
import { getProgramIds } from "../constants/programs";
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
        signMessage: vi
          .fn()
          .mockResolvedValue([
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

    const entityIx = await client.ipCore.entity.createIx({
      handle: "entity-1",
      additionalControllers: [],
      signatureThreshold: 1,
    });

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
