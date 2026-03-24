import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getProgramIds } from "../src/constants/programs";
import { sha256Hash, utf8Bytes } from "../src/utils/bytes";
import type { MyceliumClient } from "../src/client/MyceliumClient";
import {
  createTestClient,
  delay,
  loadKeypair,
  saveResult,
} from "./helpers/setup";
import { state } from "./helpers/state";

describe("IP Metadata", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  const metadataContent = JSON.stringify({ title: "Test IP", format: "text" });
  const dataHash = sha256Hash(utf8Bytes(metadataContent));
  const cid = `cid://ip-meta-${Date.now()}`;

  beforeAll(() => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createIpMetadataIx
  // -------------------------------------------------------------------------
  describe("metadata.createIpMetadataIx", () => {
    it("builds a valid create-ip-metadata instruction", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.schema).toBeDefined();

      const ix = await client.ipCore.metadata.createIpMetadataIx({
        ip: state.ip,
        ownerEntity: state.entity,
        schema: state.schema,
        dataHash,
        cid,
        controller: keypair.publicKey,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // createIpMetadata  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("metadata.createIpMetadata", () => {
    it("creates IP metadata on devnet", async () => {
      expect(state.ip).toBeDefined();
      expect(state.entity).toBeDefined();
      expect(state.schema).toBeDefined();

      const result = await client.ipCore.metadata.createIpMetadata({
        ip: state.ip,
        ownerEntity: state.entity,
        schema: state.schema,
        dataHash,
        cid,
        controller: keypair.publicKey,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("ip-metadata-create", result);
    });
  });
});
