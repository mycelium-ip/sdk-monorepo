// This file defines the entire public SDK surface.
// Do not export internal modules directly.
// Provider

// Re-export event types and cluster type from core-sdk for convenience
export type { MyceliumCluster } from "@mycelium-ip/core-sdk";
export type {
  AccountWithPublicKey,
  ConfigInitialized,
  ConfigUpdated,
  DerivativeLinkAccount,
  DerivativeLinkFilter,
  DerivativeLicenseUpdated,
  DerivativeLinkCreated,
  EntityAccount,
  EntityControlTransferred,
  EntityCreated,
  EntityFilter,
  EntityMetadataCreated,
  IpAccount,
  IpCoreEvent,
  IpCreated,
  IpFilter,
  IpMetadataCreated,
  IpTransferred,
  LicenseAccount,
  LicenseCreated,
  LicenseEvent,
  LicenseFilter,
  LicenseGrantAccount,
  LicenseGrantCreated,
  LicenseGrantFilter,
  LicenseGrantRevoked,
  LicenseRevoked,
  LicenseUpdated,
  MetadataAccount,
  MetadataFilter,
  MetadataSchemaAccount,
  MetadataSchemaCreated,
  PaginatedResult,
  PaginationOptions,
  TreasuryInitialized,
  TreasuryWithdrawal,
} from "@mycelium-ip/core-sdk";

// Derivative hooks
export { useCreateDerivativeLink } from "./hooks/derivative/useCreateDerivativeLink";
export { useDerivativeLink } from "./hooks/derivative/useDerivativeLink";
export { useInfiniteDerivativeLinks } from "./hooks/derivative/useInfiniteDerivativeLinks";
export { useUpdateDerivativeLicense } from "./hooks/derivative/useUpdateDerivativeLicense";
// Entity hooks
export { useCreateEntity } from "./hooks/entity/useCreateEntity";
export { useEntity } from "./hooks/entity/useEntity";
export { useInfiniteEntities } from "./hooks/entity/useInfiniteEntities";
export {
  useCreateEntityWithMetadata,
  type CreateEntityWithMetadataParams,
  type CreateEntityWithMetadataResult,
} from "./hooks/entity/useCreateEntityWithMetadata";
export { useTransferEntityControl } from "./hooks/entity/useTransferEntityControl";
// Grant hooks
export { useCreateLicenseGrant } from "./hooks/grant/useCreateLicenseGrant";
export { useLicenseGrant } from "./hooks/grant/useLicenseGrant";
export { useInfiniteLicenseGrants } from "./hooks/grant/useInfiniteLicenseGrants";
export { useRevokeLicenseGrant } from "./hooks/grant/useRevokeLicenseGrant";
// Internal accessor hooks
export { useMyceliumClient } from "./hooks/internal/useMyceliumClient";
export { useMyceliumConnection } from "./hooks/internal/useMyceliumConnection";
export { useMyceliumContext } from "./hooks/internal/useMyceliumContext";
export { useMyceliumWallet } from "./hooks/internal/useMyceliumWallet";

// IP hooks
export { useCreateIp } from "./hooks/ip/useCreateIp";
export { useIp } from "./hooks/ip/useIp";
export { useInfiniteIps } from "./hooks/ip/useInfiniteIps";
export {
  useCreateIpWithMetadata,
  type CreateIpWithMetadataParams,
  type CreateIpWithMetadataResult,
} from "./hooks/ip/useCreateIpWithMetadata";
export { useTransferIp } from "./hooks/ip/useTransferIp";
// License hooks
export { useCreateLicense } from "./hooks/license/useCreateLicense";
export { useLicense } from "./hooks/license/useLicense";
export { useInfiniteLicenses } from "./hooks/license/useInfiniteLicenses";
export { useRevokeLicense } from "./hooks/license/useRevokeLicense";
export { useUpdateLicense } from "./hooks/license/useUpdateLicense";
export { useCreateEntityMetadata } from "./hooks/metadata/useCreateEntityMetadata";
export { useCreateIpMetadata } from "./hooks/metadata/useCreateIpMetadata";
// Metadata hooks
export { useCreateMetadataSchema } from "./hooks/metadata/useCreateMetadataSchema";
export { useMetadata } from "./hooks/metadata/useMetadata";
export { useInfiniteMetadata } from "./hooks/metadata/useInfiniteMetadata";
// Query keys
export { queryKeys } from "./hooks/queries/queryKeys";
export type { MyceliumContextValue } from "./provider/context";
export {
  MyceliumIpProvider,
  type MyceliumIpProviderOptions,
  type MyceliumIpProviderProps,
} from "./provider/MyceliumIpProvider";
// Types
export type {
  StandardWalletWrapper,
  UnsupportedFeatureError,
} from "@mycelium-ip/core-sdk";
export type { TransactionExecutor } from "./types";

// Utilities
export {
  clusterToChain,
  executeTransaction,
  executeTransactionWithInstructions,
  type TransactionResult,
} from "./utils/transaction";
