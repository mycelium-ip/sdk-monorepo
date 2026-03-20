import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { getProgramIds } from "../src/constants/programs";
import type { MyceliumClient } from "../src/client/MyceliumClient";
import {
  createTestClient,
  delay,
  loadKeypair,
  saveResult,
} from "./helpers/setup";
import { state } from "./helpers/state";

describe("Entity", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  beforeAll(() => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createIx
  // -------------------------------------------------------------------------
  describe("entity.createIx", () => {
    it("builds a valid create-entity instruction", async () => {
      // Fetch the current entity count so we can predict the PDA
      const entityCount = await client.ipCore.fetchEntityCount(
        keypair.publicKey,
      );

      const ix = await client.ipCore.entity.createIx({});

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );

      // entity PDA should be present in the instruction accounts
      const [entityPda] = deriveEntityPda(
        keypair.publicKey,
        entityCount,
        client.ipCore.program.programId,
      );
      const entityKey = ix.keys.find(
        (k) => k.pubkey.toBase58() === entityPda.toBase58(),
      );
      expect(entityKey).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // create  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("entity.create", () => {
    it("creates an entity on devnet", async () => {
      const result = await client.ipCore.entity.create({});

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      // Derive the entity PDA from the index in the emitted event
      const [entityPda] = deriveEntityPda(
        keypair.publicKey,
        result.event!.index,
        client.ipCore.program.programId,
      );
      state.entity = entityPda;

      saveResult("entity-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // transferControlIx
  // -------------------------------------------------------------------------
  describe("entity.transferControlIx", () => {
    it("builds a valid transfer-entity-control instruction", async () => {
      expect(state.entity).toBeDefined();

      const newController = Keypair.generate().publicKey;
      const ix = await client.ipCore.entity.transferControlIx({
        entity: state.entity,
        newController,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // transferControl  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("entity.transferControl", () => {
    it("transfers entity control on devnet", async () => {
      expect(state.entity).toBeDefined();

      // Transfer control to self (no-op but validates the instruction works)
      const result = await client.ipCore.entity.transferControl({
        entity: state.entity,
        newController: keypair.publicKey,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("entity-transfer-control", result);
    });
  });
});
