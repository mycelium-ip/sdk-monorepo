import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { getProgramIds } from "../constants/programs";
import { utf8Bytes } from "../utils/conversions";
import { MyceliumClient } from "./MyceliumClient";

describe("MyceliumClient smoke", () => {
  it("builds instructions from each module", async () => {
    const walletKeypair = Keypair.generate();
    const wallet = {
      publicKey: walletKeypair.publicKey,
      async signTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
      ): Promise<T> {
        return transaction;
      },
      async signAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[],
      ): Promise<T[]> {
        return transactions;
      },
      async signMessage(message: Uint8Array): Promise<Uint8Array> {
        return message;
      },
    };

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
      data: utf8Bytes("schema-content"),
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
    const walletKeypair = Keypair.generate();
    const wallet = {
      publicKey: walletKeypair.publicKey,
      async signTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
      ): Promise<T> {
        return transaction;
      },
      async signAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[],
      ): Promise<T[]> {
        return transactions;
      },
    };

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
    const walletKeypair = Keypair.generate();
    const wallet = {
      publicKey: walletKeypair.publicKey,
      async signTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
      ): Promise<T> {
        return transaction;
      },
      async signAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[],
      ): Promise<T[]> {
        return transactions;
      },
    };

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
