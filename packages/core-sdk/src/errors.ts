import type { PublicKey } from "@solana/web3.js";

/**
 * Base error class for all Mycelium SDK errors.
 *
 * Provides a `code` discriminant for programmatic matching without
 * relying on message string comparison.
 */
export class MyceliumError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MyceliumError";
    this.code = code;
  }
}

/**
 * Thrown when a required token account (ATA) does not exist on-chain.
 */
export class TokenAccountNotFoundError extends MyceliumError {
  readonly account: PublicKey;
  readonly mint: PublicKey;

  constructor(account: PublicKey, mint: PublicKey) {
    super(
      "TOKEN_ACCOUNT_NOT_FOUND",
      `Token account does not exist: ${account.toBase58()}. ` +
        `Create an Associated Token Account for mint ${mint.toBase58()} first.`,
    );
    this.name = "TokenAccountNotFoundError";
    this.account = account;
    this.mint = mint;
  }
}

/**
 * Thrown when the payer's token balance is below the required registration fee.
 */
export class InsufficientTokenBalanceError extends MyceliumError {
  readonly required: bigint;
  readonly available: bigint;
  readonly mint: PublicKey;

  constructor(required: bigint, available: bigint, mint: PublicKey) {
    super(
      "INSUFFICIENT_TOKEN_BALANCE",
      `Insufficient token balance for IP registration. ` +
        `Required: ${required.toString()}, available: ${available.toString()} ` +
        `(mint: ${mint.toBase58()}).`,
    );
    this.name = "InsufficientTokenBalanceError";
    this.required = required;
    this.available = available;
    this.mint = mint;
  }
}

/**
 * Thrown when the registrant entity PDA does not exist on-chain.
 */
export class EntityNotFoundError extends MyceliumError {
  readonly entity: PublicKey;

  constructor(entity: PublicKey) {
    super(
      "ENTITY_NOT_FOUND",
      `Entity account does not exist: ${entity.toBase58()}. ` +
        `Create the entity before registering IP.`,
    );
    this.name = "EntityNotFoundError";
    this.entity = entity;
  }
}

/**
 * Thrown when a required on-chain account (IP, license, license grant, etc.)
 * does not exist.
 */
export class AccountNotFoundError extends MyceliumError {
  readonly account: PublicKey;
  readonly accountType: string;

  constructor(account: PublicKey, accountType: string) {
    super(
      "ACCOUNT_NOT_FOUND",
      `${accountType} account does not exist: ${account.toBase58()}.`,
    );
    this.name = "AccountNotFoundError";
    this.account = account;
    this.accountType = accountType;
  }
}
