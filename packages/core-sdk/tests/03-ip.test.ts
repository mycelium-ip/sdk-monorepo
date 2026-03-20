import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { deriveIpPda } from "../src/pda/ip";
import { getProgramIds } from "../src/constants/programs";
import type { MyceliumClient } from "../src/client/MyceliumClient";
import {
  createTestClient,
  delay,
  ensureTokenAccounts,
  loadKeypair,
  randomContentHash,
  saveResult,
} from "./helpers/setup";
import { state } from "./helpers/state";

describe("IP", () => {
  let client: MyceliumClient;
  let keypair: Keypair;
  let contentHash: Uint8Array;
  let treasuryTokenAccount: import("@solana/web3.js").PublicKey;
  let payerTokenAccount: import("@solana/web3.js").PublicKey;

  beforeAll(async () => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
    contentHash = randomContentHash();
    const accounts = await ensureTokenAccounts(client, keypair);
    treasuryTokenAccount = accounts.treasuryTokenAccount;
    payerTokenAccount = accounts.payerTokenAccount;
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createIx
  // -------------------------------------------------------------------------
  describe("ip.createIx", () => {
    it("builds a valid create-ip instruction", async () => {
      expect(state.entity).toBeDefined();

      const ix = await client.ipCore.ip.createIx({
        registrantEntity: state.entity,
        contentHash,
        treasuryTokenAccount,
        payerTokenAccount,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );

      const [ipPda] = deriveIpPda(
        state.entity,
        contentHash,
        client.ipCore.program.programId,
      );
      const ipKey = ix.keys.find(
        (k) => k.pubkey.toBase58() === ipPda.toBase58(),
      );
      expect(ipKey).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // create  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("ip.create", () => {
    it("creates an IP on devnet", async () => {
      expect(state.entity).toBeDefined();

      const result = await client.ipCore.ip.create({
        registrantEntity: state.entity,
        contentHash,
        treasuryTokenAccount,
        payerTokenAccount,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      const [ipPda] = deriveIpPda(
        state.entity,
        contentHash,
        client.ipCore.program.programId,
      );
      state.ip = ipPda;

      saveResult("ip-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // transferIx
  // -------------------------------------------------------------------------
  describe("ip.transferIx", () => {
    it("builds a valid transfer-ip instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      // Create second entity for transfer destination
      const createResult = await client.ipCore.entity.create({});
      expect(createResult.signature).toBeTruthy();

      const [entity2] = deriveEntityPda(
        keypair.publicKey,
        createResult.event!.index,
        client.ipCore.program.programId,
      );
      state.secondEntity = entity2;

      await delay();

      const ix = await client.ipCore.ip.transferIx({
        ip: state.ip,
        currentOwnerEntity: state.entity,
        newOwnerEntity: state.secondEntity,
        controller: keypair.publicKey,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // transfer  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("ip.transfer", () => {
    it("transfers an IP on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.secondEntity).toBeDefined();

      const result = await client.ipCore.ip.transfer({
        ip: state.ip,
        currentOwnerEntity: state.entity,
        newOwnerEntity: state.secondEntity,
        controller: keypair.publicKey,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("ip-transfer", result);

      // Transfer back so original entity remains the owner for subsequent tests
      await delay();
      await client.ipCore.ip.transfer({
        ip: state.ip,
        currentOwnerEntity: state.secondEntity,
        newOwnerEntity: state.entity,
        controller: keypair.publicKey,
      });
    });
  });
});
