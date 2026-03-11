import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveLicensePda } from "../src/pda/license";
import { getProgramIds } from "../src/constants/programs";
import type { MyceliumClient } from "../src/client/MyceliumClient";
import {
  createTestClient,
  delay,
  loadKeypair,
  saveResult,
} from "./helpers/setup";
import { state } from "./helpers/state";

describe("License", () => {
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
  describe("license.createIx", () => {
    it("builds a valid create-license instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      const ix = await client.license.license.createIx({
        originIp: state.ip,
        ownerEntity: state.entity,
        derivativesAllowed: true,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").license.toBase58(),
      );

      const [licensePda] = deriveLicensePda(
        state.ip,
        client.license.program.programId,
      );
      const licenseKey = ix.keys.find(
        (k) => k.pubkey.toBase58() === licensePda.toBase58(),
      );
      expect(licenseKey).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // create  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("license.create", () => {
    it("creates a license on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      const result = await client.license.license.create({
        originIp: state.ip,
        ownerEntity: state.entity,
        derivativesAllowed: true,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      const [licensePda] = deriveLicensePda(
        state.ip,
        client.license.program.programId,
      );
      state.license = licensePda;

      saveResult("license-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // updateIx
  // -------------------------------------------------------------------------
  describe("license.updateIx", () => {
    it("builds a valid update-license instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      const ix = await client.license.license.updateIx({
        originIp: state.ip,
        authorityEntity: state.entity,
        derivativesAllowed: false,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").license.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // update  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("license.update", () => {
    it("updates a license on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.license).toBeDefined();

      // Toggle derivativesAllowed to false
      const result = await client.license.license.update({
        originIp: state.ip,
        authorityEntity: state.entity,
        derivativesAllowed: false,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("license-update", result);

      // Revert to true for derivative tests downstream
      await delay();
      await client.license.license.update({
        originIp: state.ip,
        authorityEntity: state.entity,
        derivativesAllowed: true,
        controllerSigners: [keypair.publicKey],
      });
    });
  });
});
