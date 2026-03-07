// This file defines the entire public SDK surface.
// Do not export internal modules directly.
// Provider

// Derivative mutation hooks
export { useCreateDerivativeLink } from "./hooks/derivative/useCreateDerivativeLink";
export { useUpdateDerivativeLicense } from "./hooks/derivative/useUpdateDerivativeLicense";
// Entity mutation hooks
export { useCreateEntity } from "./hooks/entity/useCreateEntity";
export { useUpdateEntityControllers } from "./hooks/entity/useUpdateEntityControllers";
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
export type { MyceliumWallet } from "./types/wallet";

// Utilities
export {
  executeTransaction,
  executeTransactionWithInstructions,
  type TransactionResult,
} from "./utils/transaction";
