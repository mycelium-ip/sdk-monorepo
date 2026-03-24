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

describe("Entity Metadata", () => {
  let client: MyceliumClient;
  let keypair: Keypair;

  const metadataContent = JSON.stringify({
    name: "Test Entity",
    description: "Integration test",
  });
  const dataHash = sha256Hash(utf8Bytes(metadataContent));
  const cid = `cid://entity-meta-${Date.now()}`;

  beforeAll(() => {
    keypair = loadKeypair();
    client = createTestClient(keypair);
  });

  afterEach(() => delay());

  // -------------------------------------------------------------------------
  // createEntityMetadataIx
  // -------------------------------------------------------------------------
  describe("metadata.createEntityMetadataIx", () => {
    it("builds a valid create-entity-metadata instruction", async () => {
      expect(state.entity).toBeDefined();
      expect(state.schema).toBeDefined();

      const ix = await client.ipCore.metadata.createEntityMetadataIx({
        entity: state.entity,
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
  // createEntityMetadata  (sends tx to devnet)
  // -------------------------------------------------------------------------
  describe("metadata.createEntityMetadata", () => {
    it("creates entity metadata on devnet", async () => {
      expect(state.entity).toBeDefined();
      expect(state.schema).toBeDefined();

      const result = await client.ipCore.metadata.createEntityMetadata({
        entity: state.entity,
        schema: state.schema,
        dataHash,
        cid,
        controller: keypair.publicKey,
      });

      expect(result.signature).toBeTruthy();
      expect(result.event).toBeDefined();

      saveResult("entity-metadata-create", result);
    });
  });
});
