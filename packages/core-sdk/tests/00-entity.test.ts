import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { getProgramIds } from "../src/constants/programs";
import type { MyceliumClient } from "../src/client/MyceliumClient";
import {
  createTestClient,
  delay,
  loadKeypair,
  randomHandle,
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
      const handle = randomHandle();
      const ix = await client.ipCore.entity.createIx({
        handle,
        additionalControllers: [],
        signatureThreshold: 1,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );

      // entity PDA should be present in the instruction accounts
      const [entityPda] = deriveEntityPda(
        keypair.publicKey,
        handle,
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
      const handle = randomHandle();
      const result = await client.ipCore.entity.create({
        handle,
        additionalControllers: [],
        signatureThreshold: 1,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      // Persist the entity PDA for downstream tests
      const [entityPda] = deriveEntityPda(
        keypair.publicKey,
        handle,
        client.ipCore.program.programId,
      );
      state.entity = entityPda;

      saveResult("entity-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // updateControllersIx
  // -------------------------------------------------------------------------
  describe("entity.updateControllersIx", () => {
    it("builds a valid update-controllers instruction", async () => {
      expect(state.entity).toBeDefined();

      const ix = await client.ipCore.entity.updateControllersIx({
        entity: state.entity,
        newControllers: [keypair.publicKey],
        newThreshold: 1,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // updateControllers  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("entity.updateControllers", () => {
    it("updates entity controllers on devnet", async () => {
      expect(state.entity).toBeDefined();

      const newController = Keypair.generate().publicKey;
      const result = await client.ipCore.entity.updateControllers({
        entity: state.entity,
        newControllers: [keypair.publicKey, newController],
        newThreshold: 1,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("entity-update-controllers", result);

      // Revert controllers back to just the keypair for subsequent tests
      await delay();
      await client.ipCore.entity.updateControllers({
        entity: state.entity,
        newControllers: [keypair.publicKey],
        newThreshold: 1,
        controllerSigners: [keypair.publicKey],
      });
    });
  });
});
