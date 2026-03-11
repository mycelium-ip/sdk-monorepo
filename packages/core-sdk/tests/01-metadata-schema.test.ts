import { Keypair } from "@solana/web3.js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { deriveMetadataSchemaPda } from "../src/pda/metadata";
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

describe("Metadata Schema", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  const schemaId = `test-schema-${Date.now().toString(36)}`;
  const schemaVersion = "v1";
  const schemaContent = JSON.stringify({
    type: "object",
    properties: { name: { type: "string" } },
  });
  const dataHash = sha256Hash(utf8Bytes(schemaContent));
  const cid = `cid://test-schema-${Date.now()}`;

  beforeAll(() => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createSchemaIx
  // -------------------------------------------------------------------------
  describe("metadata.createSchemaIx", () => {
    it("builds a valid create-schema instruction", async () => {
      const ix = await client.ipCore.metadata.createSchemaIx({
        id: schemaId,
        version: schemaVersion,
        dataHash,
        cid,
      });

      expect(ix.keys.length).toBeGreaterThan(0);
      expect(ix.programId.toBase58()).toBe(
        getProgramIds("devnet").ipCore.toBase58(),
      );

      const [schemaPda] = deriveMetadataSchemaPda(
        schemaId,
        schemaVersion,
        client.ipCore.program.programId,
      );
      const schemaKey = ix.keys.find(
        (k) => k.pubkey.toBase58() === schemaPda.toBase58(),
      );
      expect(schemaKey).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // createSchema  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("metadata.createSchema", () => {
    it("creates a metadata schema on devnet", async () => {
      const result = await client.ipCore.metadata.createSchema({
        id: schemaId,
        version: schemaVersion,
        dataHash,
        cid,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      const [schemaPda] = deriveMetadataSchemaPda(
        schemaId,
        schemaVersion,
        client.ipCore.program.programId,
      );
      state.schema = schemaPda;

      saveResult("metadata-schema-create", result);
    });
  });
});
