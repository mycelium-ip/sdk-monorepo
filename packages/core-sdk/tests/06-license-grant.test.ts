import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { deriveLicenseGrantPda } from "../src/pda/license";
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

describe("License Grant", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  beforeAll(async () => {
    keypair = loadKeypair();
    client = createTestClient(keypair);

    // Create a grantee entity for the grant tests
    const granteeHandle = randomHandle();
    const createResult = await client.ipCore.entity.create({
      handle: granteeHandle,
      additionalControllers: [],
      signatureThreshold: 1,
    });
    expect(createResult.signature).toBeTruthy();

    const [granteePda] = deriveEntityPda(
      keypair.publicKey,
      granteeHandle,
      client.ipCore.program.programId,
    );
    state.granteeEntity = granteePda;

    await delay();
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createIx
  // -------------------------------------------------------------------------
  describe("grant.createIx", () => {
    it("builds a valid create-license-grant instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.granteeEntity).toBeDefined();

      const ix = await client.license.grant.createIx({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: state.granteeEntity,
        expiration: 0,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").license.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // create  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("grant.create", () => {
    it("creates a license grant on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.license).toBeDefined();
      expect(state.granteeEntity).toBeDefined();

      const result = await client.license.grant.create({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: state.granteeEntity,
        expiration: 0, // no expiration
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      const [grantPda] = deriveLicenseGrantPda(
        state.license,
        state.granteeEntity,
        client.license.program.programId,
      );
      state.licenseGrant = grantPda;

      saveResult("license-grant-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // revokeIx
  // -------------------------------------------------------------------------
  describe("grant.revokeIx", () => {
    it("builds a valid revoke-license-grant instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      // Create a second grantee + grant specifically for revocation testing
      const revokeGranteeHandle = randomHandle();
      await client.ipCore.entity.create({
        handle: revokeGranteeHandle,
        additionalControllers: [],
        signatureThreshold: 1,
      });
      const [revokeGranteePda] = deriveEntityPda(
        keypair.publicKey,
        revokeGranteeHandle,
        client.ipCore.program.programId,
      );

      await delay();

      // Create the grant that we will revoke
      const createResult = await client.license.grant.create({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: revokeGranteePda,
        expiration: 0,
        controllerSigners: [keypair.publicKey],
      });
      expect(createResult.signature).toBeTruthy();

      const [revokableGrantPda] = deriveLicenseGrantPda(
        state.license,
        revokeGranteePda,
        client.license.program.programId,
      );
      state.revokableGrant = revokableGrantPda;

      await delay();

      const ix = await client.license.grant.revokeIx({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: revokeGranteePda,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").license.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // revoke  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("grant.revoke", () => {
    it("revokes a license grant on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();

      // Create a fresh grantee + grant for this revoke test
      const revokeHandle = randomHandle();
      await client.ipCore.entity.create({
        handle: revokeHandle,
        additionalControllers: [],
        signatureThreshold: 1,
      });
      const [revokeGranteePda] = deriveEntityPda(
        keypair.publicKey,
        revokeHandle,
        client.ipCore.program.programId,
      );

      await delay();

      await client.license.grant.create({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: revokeGranteePda,
        expiration: 0,
        controllerSigners: [keypair.publicKey],
      });

      await delay();

      const result = await client.license.grant.revoke({
        originIp: state.ip,
        authorityEntity: state.entity,
        granteeEntity: revokeGranteePda,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("license-grant-revoke", result);
    });
  });
});
