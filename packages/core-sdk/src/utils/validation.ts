import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
import {
  AccountNotFoundError,
  EntityNotFoundError,
  InsufficientTokenBalanceError,
  TokenAccountNotFoundError,
} from "../errors";
import type { CreateIpParams, EntityAccount, ProtocolConfig } from "../types";
import { deriveAta } from "./ata";
import { utf8Bytes } from "./bytes";
import { PDA_SEEDS } from "../constants/programs";
import type { IpCoreClient } from "../programs/ipCore/IpCoreClient";

/**
 * Result of a successful pre-flight validation.
 *
 * Carries the data already fetched during validation so callers can
 * pass it through to instruction building without redundant RPC calls.
 *
 * When the registration fee is 0, token accounts are `null` — the
 * on-chain program does not require them.
 */
export interface PreflightResult {
  config: ProtocolConfig;
  payerTokenAccount: PublicKey | null;
  treasuryTokenAccount: PublicKey | null;
}

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

/**
 * Fetch an entity account and validate that it exists on-chain.
 *
 * The on-chain program validates that the controller signer matches
 * `entity.controller`; this helper ensures the entity exists before
 * submitting the transaction.
 *
 * @throws {EntityNotFoundError} entity PDA does not exist on-chain
 */
export async function validateEntityAuthority(
  client: IpCoreClient,
  entityPda: PublicKey,
): Promise<EntityAccount> {
  const entityAccount = await client.fetchEntity(entityPda);
  if (!entityAccount) {
    throw new EntityNotFoundError(entityPda);
  }

  return entityAccount;
}

/**
 * Verify that an account exists on-chain.
 *
 * @throws {AccountNotFoundError} if the account does not exist
 */
export async function validateAccountExists(
  connection: Connection,
  address: PublicKey,
  accountType: string,
): Promise<void> {
  const info = await connection.getAccountInfo(address);
  if (!info) {
    throw new AccountNotFoundError(address, accountType);
  }
}

/**
 * Validate entity authority using the license program's ip_core program ID
 * to fetch the entity account cross-program.
 *
 * The license module doesn't have direct access to `IpCoreClient`, so this
 * helper accepts the raw ip_core program and validates entity existence.
 *
 * @throws {EntityNotFoundError} entity PDA does not exist on-chain
 */
export async function validateEntityAuthorityRaw(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipCoreProgram: Program<any>,
  entityPda: PublicKey,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ipCoreProgram.account as any).entity.fetch(entityPda);
  } catch {
    throw new EntityNotFoundError(entityPda);
  }
}

// ---------------------------------------------------------------------------
// IP registration validation
// ---------------------------------------------------------------------------

/**
 * Validate that an IP registration can succeed before building the transaction.
 *
 * Performs read-only RPC checks for:
 * 1. Entity existence
 * 2. Payer token account existence (skipped when registration fee is 0)
 * 3. Payer token balance ≥ registration fee (skipped when fee is 0)
 * 4. Treasury token account existence (skipped when fee is 0)
 *
 * @throws {EntityNotFoundError}           registrant entity does not exist
 * @throws {TokenAccountNotFoundError}     payer or treasury ATA is missing
 * @throws {InsufficientTokenBalanceError} payer balance too low
 */
export async function validateIpRegistration(
  client: IpCoreClient,
  params: CreateIpParams,
): Promise<PreflightResult> {
  const connection = client.provider.connection;
  const payer = params.payer ?? client.provider.wallet.publicKey;

  // --- Step 1: fetch config + validate entity exists in parallel -----------
  const [config] = await Promise.all([
    client.fetchConfig(),
    validateEntityAuthority(client, params.registrantEntity),
  ]);

  // --- Step 2: when fee is 0, token accounts are not required --------------
  if (config.registrationFee === BigInt(0)) {
    return { config, payerTokenAccount: null, treasuryTokenAccount: null };
  }

  // --- Step 3: resolve token accounts ---------------------------------------
  const mint = config.registrationCurrency;
  const [treasury] = PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.treasury)],
    client.program.programId,
  );
  const payerTokenAccount = params.payerTokenAccount ?? deriveAta(mint, payer);
  const treasuryTokenAccount =
    params.treasuryTokenAccount ?? deriveAta(mint, treasury);

  // --- Step 4: check both ATAs exist in parallel ----------------------------
  const [payerAtaInfo, treasuryAtaInfo] = await Promise.all([
    connection.getAccountInfo(payerTokenAccount),
    connection.getAccountInfo(treasuryTokenAccount),
  ]);

  if (!payerAtaInfo) {
    throw new TokenAccountNotFoundError(payerTokenAccount, mint);
  }
  if (!treasuryAtaInfo) {
    throw new TokenAccountNotFoundError(treasuryTokenAccount, mint);
  }

  // --- Step 5: balance check ------------------------------------------------
  const balance = await connection.getTokenAccountBalance(payerTokenAccount);
  const available = BigInt(balance.value.amount);
  if (available < config.registrationFee) {
    throw new InsufficientTokenBalanceError(
      config.registrationFee,
      available,
      mint,
    );
  }

  return { config, payerTokenAccount, treasuryTokenAccount };
}
