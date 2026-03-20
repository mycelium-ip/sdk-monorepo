import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { deriveIpPda } from "../src/pda/ip";
import { deriveDerivativeLinkPda } from "../src/pda/derivative";
import { deriveLicensePda, deriveLicenseGrantPda } from "../src/pda/license";
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

describe("Derivative", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  beforeAll(async () => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
    const { treasuryTokenAccount, payerTokenAccount } =
      await ensureTokenAccounts(client, keypair);

    // Create a child-owner entity and a child IP for derivative linking
    const childCreateResult = await client.ipCore.entity.create({});
    const [childOwnerPda] = deriveEntityPda(
      keypair.publicKey,
      childCreateResult.event!.index,
      client.ipCore.program.programId,
    );
    state.childOwnerEntity = childOwnerPda;

    await delay();

    // Create child IP
    const childHash = randomContentHash();
    await client.ipCore.ip.create({
      registrantEntity: childOwnerPda,
      contentHash: childHash,
      controllerSigners: [keypair.publicKey],
      treasuryTokenAccount,
      payerTokenAccount,
    });
    const [childIpPda] = deriveIpPda(
      childOwnerPda,
      childHash,
      client.ipCore.program.programId,
    );
    state.childIp = childIpPda;

    await delay();

    // Grant the child owner entity a license from the parent IP
    // (grantee == childOwnerEntity so they can create derivative link)
    await client.license.grant.create({
      originIp: state.ip,
      authorityEntity: state.entity,
      granteeEntity: childOwnerPda,
      expiration: 0,
      controllerSigners: [keypair.publicKey],
    });

    await delay();
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createIx
  // -------------------------------------------------------------------------
  describe("derivative.createIx", () => {
    it("builds a valid create-derivative-link instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.childIp).toBeDefined();
      expect(state.childOwnerEntity).toBeDefined();
      expect(state.license).toBeDefined();

      const [grantPda] = deriveLicenseGrantPda(
        state.license,
        state.childOwnerEntity,
        client.license.program.programId,
      );

      const ix = await client.ipCore.derivative.createIx({
        parentIp: state.ip,
        childIp: state.childIp,
        childOwnerEntity: state.childOwnerEntity,
        licenseGrant: grantPda,
        license: state.license,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );

      const [derivPda] = deriveDerivativeLinkPda(
        state.ip,
        state.childIp,
        client.ipCore.program.programId,
      );
      const derivKey = ix.keys.find(
        (k) => k.pubkey.toBase58() === derivPda.toBase58(),
      );
      expect(derivKey).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // create  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("derivative.create", () => {
    it("creates a derivative link on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.childIp).toBeDefined();
      expect(state.childOwnerEntity).toBeDefined();
      expect(state.license).toBeDefined();

      const [grantPda] = deriveLicenseGrantPda(
        state.license,
        state.childOwnerEntity,
        client.license.program.programId,
      );

      const result = await client.ipCore.derivative.create({
        parentIp: state.ip,
        childIp: state.childIp,
        childOwnerEntity: state.childOwnerEntity,
        licenseGrant: grantPda,
        license: state.license,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      const [derivPda] = deriveDerivativeLinkPda(
        state.ip,
        state.childIp,
        client.ipCore.program.programId,
      );
      state.derivativeLink = derivPda;

      saveResult("derivative-create", result);
    });
  });

  // -------------------------------------------------------------------------
  // updateLicenseIx
  // -------------------------------------------------------------------------
  describe("derivative.updateLicenseIx", () => {
    it("builds a valid update-derivative-license instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.childIp).toBeDefined();
      expect(state.childOwnerEntity).toBeDefined();
      expect(state.license).toBeDefined();

      const [grantPda] = deriveLicenseGrantPda(
        state.license,
        state.childOwnerEntity,
        client.license.program.programId,
      );

      const ix = await client.ipCore.derivative.updateLicenseIx({
        parentIp: state.ip,
        childIp: state.childIp,
        childOwnerEntity: state.childOwnerEntity,
        newLicenseGrant: grantPda,
        newLicense: state.license,
        controllerSigners: [keypair.publicKey],
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // updateLicense  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("derivative.updateLicense", () => {
    it("updates derivative license on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.childIp).toBeDefined();
      expect(state.childOwnerEntity).toBeDefined();
      expect(state.license).toBeDefined();
      expect(state.derivativeLink).toBeDefined();

      const [grantPda] = deriveLicenseGrantPda(
        state.license,
        state.childOwnerEntity,
        client.license.program.programId,
      );

      const result = await client.ipCore.derivative.updateLicense({
        parentIp: state.ip,
        childIp: state.childIp,
        childOwnerEntity: state.childOwnerEntity,
        newLicenseGrant: grantPda,
        newLicense: state.license,
        derivativeLink: state.derivativeLink,
        controllerSigners: [keypair.publicKey],
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("derivative-update-license", result);
    });
  });
});
