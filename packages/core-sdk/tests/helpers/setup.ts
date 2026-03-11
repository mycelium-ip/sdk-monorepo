import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { MyceliumClient } from "../../src/client/MyceliumClient";
import { sha256Hash, utf8Bytes } from "../../src/utils/bytes";
import { createKeypairWallet } from "./keypair-wallet";
import type { TransactionResult } from "../../src/types";

const DEVNET_RPC = "https://api.devnet.solana.com";
const RESULTS_DIR = resolve(__dirname, "../results");

/**
 * Load a Solana keypair from the file path specified by `KEYPAIR_PATH`.
 */
export function loadKeypair(): Keypair {
  const keypairPath = process.env.KEYPAIR_PATH;
  if (!keypairPath) {
    throw new Error(
      "KEYPAIR_PATH environment variable is required.\n" +
        "Set it to the path of your Solana keypair JSON file.\n" +
        "Example: KEYPAIR_PATH=~/.config/solana/id.json pnpm run test:devnet",
    );
  }

  const resolved = keypairPath.startsWith("~")
    ? keypairPath.replace("~", process.env.HOME ?? "")
    : keypairPath;

  const raw = readFileSync(resolved, "utf-8");
  const secretKey = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Create a `MyceliumClient` wired to devnet with the given keypair.
 */
export function createTestClient(keypair: Keypair): MyceliumClient {
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = createKeypairWallet(keypair);
  return new MyceliumClient({ connection, wallet, cluster: "devnet" });
}

/**
 * Generate a unique handle string (lowercase alphanumeric, ≤ 32 chars).
 * Uses a timestamp + random suffix to avoid PDA collisions across runs.
 */
export function randomHandle(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `t${ts}${rand}`.slice(0, 32);
}

/**
 * Generate a random 32-byte content hash.
 */
export function randomContentHash(): Uint8Array {
  const seed = `${Date.now()}-${Math.random()}`;
  return sha256Hash(utf8Bytes(seed));
}

/**
 * Serialise a `TransactionResult` and write it to `tests/results/<name>.json`.
 */
export function saveResult<E>(
  testName: string,
  result: TransactionResult<E>,
): void {
  mkdirSync(RESULTS_DIR, { recursive: true });

  const payload = {
    testName,
    signature: result.signature,
    event: serialiseEvent(result.event),
    timestamp: new Date().toISOString(),
  };

  const filePath = resolve(RESULTS_DIR, `${testName}.json`);
  writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

/**
 * Ensure the treasury and payer ATAs exist for the registration currency,
 * and that the payer has enough tokens to register IPs.
 *
 * Must be called once before any `ip.create` / `ip.createIx` call.
 */
export async function ensureTokenAccounts(
  client: MyceliumClient,
  keypair: Keypair,
): Promise<{ treasuryTokenAccount: PublicKey; payerTokenAccount: PublicKey }> {
  const connection = client.ipCore.provider.connection;
  const config = await client.ipCore.fetchConfig();
  const mint = config.registrationCurrency;

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    client.ipCore.program.programId,
  );

  // Create ATAs if they don't exist (idempotent)
  const treasuryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    mint,
    treasuryPda,
    true, // allowOwnerOffCurve — treasury is a PDA
  );

  const payerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    mint,
    keypair.publicKey,
  );

  // Mint tokens if balance is too low (only works if keypair is mint authority)
  const balance = await connection.getTokenAccountBalance(payerAta.address);
  if (balance.value.uiAmount === null || balance.value.uiAmount < 10) {
    try {
      await mintTo(
        connection,
        keypair,
        mint,
        payerAta.address,
        keypair.publicKey,
        100_000_000,
      );
    } catch {
      // Not the mint authority — user must fund the account manually
      console.warn(
        `Warning: payer token balance is low (${balance.value.uiAmount ?? 0}). ` +
          "Mint tokens manually if IP registration tests fail.",
      );
    }
  }

  return {
    treasuryTokenAccount: treasuryAta.address,
    payerTokenAccount: payerAta.address,
  };
}

/**
 * Small delay to avoid devnet RPC rate-limits between transactions.
 */
export function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// internal helpers
// ---------------------------------------------------------------------------

function serialiseEvent(event: unknown): unknown {
  if (event == null) return null;
  if (typeof event !== "object") return event;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event as Record<string, unknown>)) {
    if (value instanceof PublicKey) {
      out[key] = value.toBase58();
    } else if (typeof value === "bigint") {
      out[key] = value.toString();
    } else if (ArrayBuffer.isView(value)) {
      out[key] = Array.from(
        new Uint8Array(
          (value as Uint8Array).buffer,
          (value as Uint8Array).byteOffset,
          (value as Uint8Array).byteLength,
        ),
      );
    } else if (Array.isArray(value)) {
      out[key] = value.map((v) => (v instanceof PublicKey ? v.toBase58() : v));
    } else if (typeof value === "object" && value !== null) {
      out[key] = serialiseEvent(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
