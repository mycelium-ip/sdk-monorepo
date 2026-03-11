import type { PublicKey } from "@solana/web3.js";

/**
 * Mutable shared state populated by earlier tests and consumed by later ones.
 *
 * Tests run sequentially (sorted by filename). Each test file writes the PDAs
 * it creates here so downstream tests can reference them without re-deriving.
 */
export const state: TestState = {} as TestState;

export interface TestState {
  /** Primary entity (created in 00-entity) */
  entity: PublicKey;
  /** Second entity for transfer/grantee tests (created in 03-ip) */
  secondEntity: PublicKey;
  /** Third entity used as grantee (created in 06-license-grant) */
  granteeEntity: PublicKey;
  /** Child IP owner entity (created in 07-derivative) */
  childOwnerEntity: PublicKey;

  /** Metadata schema (created in 01-metadata-schema) */
  schema: PublicKey;

  /** Primary IP (created in 03-ip) */
  ip: PublicKey;
  /** IP used for license revoke test (created in 08-license-revoke) */
  revokeIp: PublicKey;
  /** Child IP for derivative test (created in 07-derivative) */
  childIp: PublicKey;

  /** License on primary IP (created in 05-license) */
  license: PublicKey;
  /** License for revoke test (created in 08-license-revoke) */
  revokeLicense: PublicKey;

  /** License grant (created in 06-license-grant) */
  licenseGrant: PublicKey;
  /** Second license grant used for revoke test (created in 06-license-grant) */
  revokableGrant: PublicKey;

  /** Derivative link (created in 07-derivative) */
  derivativeLink: PublicKey;
}
