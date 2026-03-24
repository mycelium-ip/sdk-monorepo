import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveEntityPda } from "../src/pda/entity";
import { deriveIpPda } from "../src/pda/ip";
import { deriveLicensePda } from "../src/pda/license";
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

describe("License Revoke", () => {
  let client: MyceliumClient;
  let keypair: Keypair;
  let revokeEntity: import("@solana/web3.js").PublicKey;
  let revokeIp: import("@solana/web3.js").PublicKey;

  beforeAll(async () => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
    const { treasuryTokenAccount, payerTokenAccount } =
      await ensureTokenAccounts(client, keypair);

    // Create a separate entity + IP + license specifically for revocation.
    // This avoids interfering with the license used by derivative tests.
    const entityCreateResult = await client.ipCore.entity.create({});
    const [entityPda] = deriveEntityPda(
      keypair.publicKey,
      entityCreateResult.event!.index,
      client.ipCore.program.programId,
    );
    revokeEntity = entityPda;

    await delay();

    const contentHash = randomContentHash();
    await client.ipCore.ip.create({
      registrantEntity: entityPda,
      contentHash,
      controller: keypair.publicKey,
      treasuryTokenAccount,
      payerTokenAccount,
    });
    const [ipPda] = deriveIpPda(
      entityPda,
      contentHash,
      client.ipCore.program.programId,
    );
    revokeIp = ipPda;
    state.revokeIp = ipPda;

    await delay();

    await client.license.license.create({
      originIp: ipPda,
      ownerEntity: entityPda,
      derivativesAllowed: false,
      controller: keypair.publicKey,
    });

    const [licensePda] = deriveLicensePda(
      ipPda,
      client.license.program.programId,
    );
    state.revokeLicense = licensePda;

    await delay();
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // revokeIx
  // -------------------------------------------------------------------------
  describe("license.revokeIx", () => {
    it("builds a valid revoke-license instruction", async () => {
      expect(revokeIp).toBeDefined();
      expect(revokeEntity).toBeDefined();

      const ix = await client.license.license.revokeIx({
        originIp: revokeIp,
        authorityEntity: revokeEntity,
        controller: keypair.publicKey,
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
  describe("license.revoke", () => {
    it("revokes a license on devnet", async () => {
      expect(revokeIp).toBeDefined();
      expect(revokeEntity).toBeDefined();

      const result = await client.license.license.revoke({
        originIp: revokeIp,
        authorityEntity: revokeEntity,
        controller: keypair.publicKey,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("license-revoke", result);
    });
  });
});
