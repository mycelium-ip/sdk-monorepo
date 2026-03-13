import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
import {
  AccountNotFoundError,
  EntityNotFoundError,
  InsufficientSignersError,
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
 */
export interface PreflightResult {
  config: ProtocolConfig;
  payerTokenAccount: PublicKey;
  treasuryTokenAccount: PublicKey;
}

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

/**
 * Fetch an entity account and validate that the provided controller signers
 * meet its multisig threshold.
 *
 * This mirrors the on-chain `validate_multisig_keys` check and is reused
 * by every module that requires entity authority.
 *
 * @throws {EntityNotFoundError}      entity PDA does not exist on-chain
 * @throws {InsufficientSignersError} signers don't meet the threshold
 */
export async function validateEntityAuthority(
  client: IpCoreClient,
  entityPda: PublicKey,
  controllerSigners?: PublicKey[],
): Promise<EntityAccount> {
  const entityAccount = await client.fetchEntity(entityPda);
  if (!entityAccount) {
    throw new EntityNotFoundError(entityPda);
  }

  const signerKeys = controllerSigners ?? [];
  const controllerSet = new Set(
    entityAccount.controllers.map((c) => c.toBase58()),
  );
  let validCount = 0;
  for (const signer of signerKeys) {
    if (controllerSet.has(signer.toBase58())) {
      validCount++;
    }
  }
  if (validCount < entityAccount.signatureThreshold) {
    throw new InsufficientSignersError(
      entityAccount.signatureThreshold,
      validCount,
    );
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
 * helper accepts the raw ip_core program and performs the same fetch+check.
 *
 * @throws {EntityNotFoundError}      entity PDA does not exist on-chain
 * @throws {InsufficientSignersError} signers don't meet the threshold
 */
export async function validateEntityAuthorityRaw(
  ipCoreProgram: Program,
  entityPda: PublicKey,
  controllerSigners?: PublicKey[],
): Promise<void> {
  let entityAccount: EntityAccount;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (ipCoreProgram.account as any).entity.fetch(entityPda);
    entityAccount = {
      creator: raw.creator,
      handle: raw.handle,
      controllers: raw.controllers,
      signatureThreshold: raw.signatureThreshold,
      currentMetadataRevision: BigInt(raw.currentMetadataRevision.toString()),
      createdAt: BigInt(raw.createdAt.toString()),
      updatedAt: BigInt(raw.updatedAt.toString()),
      bump: raw.bump,
    };
  } catch {
    throw new EntityNotFoundError(entityPda);
  }

  const signerKeys = controllerSigners ?? [];
  const controllerSet = new Set(
    entityAccount.controllers.map((c) => c.toBase58()),
  );
  let validCount = 0;
  for (const signer of signerKeys) {
    if (controllerSet.has(signer.toBase58())) {
      validCount++;
    }
  }
  if (validCount < entityAccount.signatureThreshold) {
    throw new InsufficientSignersError(
      entityAccount.signatureThreshold,
      validCount,
    );
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
 * 2. Controller / multisig authority (mirrors on-chain `validate_multisig_keys`)
 * 3. Payer token account existence
 * 4. Payer token balance ≥ registration fee
 * 5. Treasury token account existence
 *
 * @throws {EntityNotFoundError}           registrant entity does not exist
 * @throws {InsufficientSignersError}      controller signers don't meet threshold
 * @throws {TokenAccountNotFoundError}     payer or treasury ATA is missing
 * @throws {InsufficientTokenBalanceError} payer balance too low
 */
export async function validateIpRegistration(
  client: IpCoreClient,
  params: CreateIpParams,
): Promise<PreflightResult> {
  const connection = client.provider.connection;
  const payer = params.payer ?? client.provider.wallet.publicKey;

  // --- Step 1: fetch config + validate entity authority in parallel ---------
  const [config] = await Promise.all([
    client.fetchConfig(),
    validateEntityAuthority(
      client,
      params.registrantEntity,
      params.controllerSigners,
    ),
  ]);

  // --- Step 2: resolve token accounts ---------------------------------------
  const mint = config.registrationCurrency;
  const [treasury] = PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.treasury)],
    client.program.programId,
  );
  const payerTokenAccount = params.payerTokenAccount ?? deriveAta(mint, payer);
  const treasuryTokenAccount =
    params.treasuryTokenAccount ?? deriveAta(mint, treasury);

  // --- Step 3: check both ATAs exist in parallel ----------------------------
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

  // --- Step 4: balance check ------------------------------------------------
  if (config.registrationFee > BigInt(0)) {
    const balance = await connection.getTokenAccountBalance(payerTokenAccount);
    const available = BigInt(balance.value.amount);
    if (available < config.registrationFee) {
      throw new InsufficientTokenBalanceError(
        config.registrationFee,
        available,
        mint,
      );
    }
  }

  return { config, payerTokenAccount, treasuryTokenAccount };
}
