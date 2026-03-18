// This file defines the entire public SDK surface.
// Do not export internal modules directly.
// Provider

// Re-export event types and cluster type from core-sdk for convenience
export type { MyceliumCluster } from "@mycelium-ip/core-sdk";
export type {
  ConfigInitialized,
  ConfigUpdated,
  DerivativeLicenseUpdated,
  DerivativeLinkCreated,
  EntityControlTransferred,
  EntityCreated,
  EntityMetadataCreated,
  IpCoreEvent,
  IpCreated,
  IpMetadataCreated,
  IpTransferred,
  LicenseCreated,
  LicenseEvent,
  LicenseGrantCreated,
  LicenseGrantRevoked,
  LicenseRevoked,
  LicenseUpdated,
  MetadataSchemaCreated,
  TreasuryInitialized,
  TreasuryWithdrawal,
} from "@mycelium-ip/core-sdk";

// Derivative mutation hooks
export { useCreateDerivativeLink } from "./hooks/derivative/useCreateDerivativeLink";
export { useUpdateDerivativeLicense } from "./hooks/derivative/useUpdateDerivativeLicense";
// Entity mutation hooks
export { useCreateEntity } from "./hooks/entity/useCreateEntity";
export {
  useCreateEntityWithMetadata,
  type CreateEntityWithMetadataParams,
  type CreateEntityWithMetadataResult,
} from "./hooks/entity/useCreateEntityWithMetadata";
export { useTransferEntityControl } from "./hooks/entity/useTransferEntityControl";
// Grant mutation hooks
export { useCreateLicenseGrant } from "./hooks/grant/useCreateLicenseGrant";
export { useRevokeLicenseGrant } from "./hooks/grant/useRevokeLicenseGrant";
// Internal accessor hooks
export { useMyceliumClient } from "./hooks/internal/useMyceliumClient";
export { useMyceliumConnection } from "./hooks/internal/useMyceliumConnection";
export { useMyceliumContext } from "./hooks/internal/useMyceliumContext";
export { useMyceliumWallet } from "./hooks/internal/useMyceliumWallet";

// IP mutation hooks
export { useCreateIp } from "./hooks/ip/useCreateIp";
export {
  useCreateIpWithMetadata,
  type CreateIpWithMetadataParams,
  type CreateIpWithMetadataResult,
} from "./hooks/ip/useCreateIpWithMetadata";
export { useTransferIp } from "./hooks/ip/useTransferIp";
// License mutation hooks
export { useCreateLicense } from "./hooks/license/useCreateLicense";
export { useRevokeLicense } from "./hooks/license/useRevokeLicense";
export { useUpdateLicense } from "./hooks/license/useUpdateLicense";
export { useCreateEntityMetadata } from "./hooks/metadata/useCreateEntityMetadata";
export { useCreateIpMetadata } from "./hooks/metadata/useCreateIpMetadata";
// Metadata mutation hooks
export { useCreateMetadataSchema } from "./hooks/metadata/useCreateMetadataSchema";
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
