# @mycelium-ip/react

React hooks for the Mycelium IP protocol. This package provides a wallet-agnostic React integration built on top of TanStack Query.

## Features

- **Wallet Standard native** — Uses the [Wallet Standard](https://github.com/wallet-standard/wallet-standard) (`@wallet-standard/base`) as its first-class wallet interface
- **TanStack Query powered** — Built-in caching, loading states, and automatic cache invalidation
- **Next.js compatible** — Works with client components out of the box
- **TypeScript first** — Full type safety with comprehensive TypeScript definitions
- **Multi-sig support** — Pass `controllerSigners` to any mutation for multi-controller entities
- **Minimal abstraction** — Thin wrapper over `@mycelium-ip/core-sdk`

## Installation

```bash
# npm
npm install @mycelium-ip/react @mycelium-ip/core-sdk

# yarn
yarn add @mycelium-ip/react @mycelium-ip/core-sdk

# pnpm
pnpm add @mycelium-ip/react @mycelium-ip/core-sdk
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install @solana/web3.js @tanstack/react-query react
```

## Quick Start

```tsx
import { Connection } from "@solana/web3.js";
import { MyceliumIpProvider, useCreateEntity } from "@mycelium-ip/react";
import type { Wallet } from "@wallet-standard/base";

// 1. Wrap your app with the provider
function App() {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet: Wallet = useYourWallet(); // Any Wallet Standard–compliant wallet

  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      <CreateEntityButton />
    </MyceliumIpProvider>
  );
}

// 2. Use hooks in your components
function CreateEntityButton() {
  const { mutate, isPending, isSuccess } = useCreateEntity();

  const handleCreate = () => {
    mutate({});
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? "Creating..." : "Create Entity"}
    </button>
  );
}
```

## Wallet Integration

The SDK uses the **Wallet Standard** (`@wallet-standard/base`) as its native wallet interface. Pass any `Wallet` that implements the standard directly to the provider — no adapter shim required.

### Required wallet features

- `solana:signTransaction` — **required**; the SDK throws `UnsupportedFeatureError` if absent
- `solana:signAndSendTransaction` — optional; preferred for transaction submission when available
- `solana:signMessage` — optional

### Solana Wallet Adapter

If you’re using [`@solana/wallet-adapter-react`](https://github.com/solana-labs/wallet-adapter), the `useWallet()` hook already returns a Wallet Standard–compliant wallet via the `wallet.adapter.wallet` property when the user connects a Standard-compatible browser extension. Use the `@solana/wallet-standard-wallet-adapter-base` package to obtain it:

```tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { MyceliumIpProvider } from "@mycelium-ip/react";
import { isStandardWallet } from "@mycelium-ip/core-sdk";

function MyceliumProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { wallet } = useWallet();

  // The adapter’s underlying Wallet Standard wallet
  const standardWallet =
    wallet?.adapter && "wallet" in wallet.adapter
      ? (wallet.adapter as any).wallet
      : null;

  if (!standardWallet || !isStandardWallet(standardWallet)) {
    return <>{children}</>;
  }

  return (
    <MyceliumIpProvider connection={connection} wallet={standardWallet}>
      {children}
    </MyceliumIpProvider>
  );
}
```

### Privy Embedded Wallet

If you’re using [`@privy-io/react-auth`](https://docs.privy.io/) with Solana embedded wallets, Privy wallets already implement the Wallet Standard. Pass the wallet directly:

```tsx
"use client";

import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { Connection } from "@solana/web3.js";
import { MyceliumIpProvider } from "@mycelium-ip/react";
import { isStandardWallet } from "@mycelium-ip/core-sdk";
import { useMemo } from "react";

function MyceliumPrivyProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const embeddedWallet = wallets[0];

  const connection = useMemo(
    () => new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!),
    [],
  );

  // If the Privy wallet exposes a Wallet Standard object, use it directly
  const standardWallet =
    embeddedWallet && "wallet" in embeddedWallet
      ? (embeddedWallet as any).wallet
      : null;

  if (
    !ready ||
    !authenticated ||
    !standardWallet ||
    !isStandardWallet(standardWallet)
  ) {
    return <>{children}</>;
  }

  return (
    <MyceliumIpProvider
      connection={connection}
      wallet={standardWallet}
      executeTransaction={async (tx) => {
        const { hash } = await signAndSendTransaction({
          transaction: tx,
          options: { sponsor: true },
        });
        return { signature: hash };
      }}
    >
      {children}
    </MyceliumIpProvider>
  );
}

export default MyceliumPrivyProvider;
```

#### Complete Privy Setup Example

Here’s a complete example showing how to set up Privy with Mycelium in a Next.js App Router application:

```tsx
// app/providers.tsx
"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import MyceliumPrivyProvider from "./MyceliumPrivyProvider";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      <MyceliumPrivyProvider>{children}</MyceliumPrivyProvider>
    </PrivyProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

````

## Provider

### MyceliumIpProvider

The provider initializes the SDK and must wrap your application (or the part that uses Mycelium hooks).

```tsx
<MyceliumIpProvider
  connection={connection}
  wallet={wallet}
  queryClient={queryClient} // optional
  options={{
    confirmation: "confirmed",
  }}
>
  <App />
</MyceliumIpProvider>
````

### Props

| Prop          | Type                        | Required | Description                                                                           |
| ------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `connection`  | `Connection`                | Yes      | Solana RPC connection                                                                 |
| `wallet`      | `Wallet \| null`            | No       | Wallet Standard–compliant wallet (`@wallet-standard/base`). Mutations throw when null |
| `queryClient` | `QueryClient`               | No       | Existing TanStack Query client. If omitted, a default client is created               |
| `options`     | `MyceliumIpProviderOptions` | No       | Provider configuration options                                                        |

### Options

| Option         | Type         | Default       | Description                                                                  |
| -------------- | ------------ | ------------- | ---------------------------------------------------------------------------- |
| `confirmation` | `Commitment` | `"confirmed"` | Transaction confirmation level (`"processed"`, `"confirmed"`, `"finalized"`) |

### Wallet Switching

When the `wallet` prop changes but `connection` and `cluster` stay the same, the provider efficiently swaps the wallet in-place via `client.setWallet()` — the SDK client, `AnchorProvider`, and `Program` instances are reused rather than reconstructed. This means wallet switching in your app "just works":

```tsx
function App() {
  const wallet = useActiveWallet(); // changes when user switches wallets

  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      <YourApp />
    </MyceliumIpProvider>
  );
}
```

If `connection` or `cluster` changes, the provider creates a fresh client automatically.

### Adding React Query Devtools

To enable React Query devtools for debugging, install the devtools package and add it to your app:

```bash
pnpm add @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </MyceliumIpProvider>
  );
}
```

## Hooks Reference

All mutation hooks return TanStack Query's `UseMutationResult`, providing:

- `mutate` / `mutateAsync` — Execute the mutation
- `isPending` — Loading state
- `isSuccess` / `isError` — Result states
- `data` — Transaction result (signature)
- `error` — Error object if failed
- `reset` — Reset mutation state

### Entity Hooks

#### useCreateEntity

Creates a new entity in the protocol. Entity index is auto-assigned from the
on-chain counter.

```tsx
import { useCreateEntity } from "@mycelium-ip/react";

function CreateEntity() {
  const { mutate, isPending } = useCreateEntity();

  const handleCreate = () => {
    mutate({});
  };

  return <button onClick={handleCreate}>Create Entity</button>;
}
```

#### useTransferEntityControl

Transfers control of an entity to a new controller.

```tsx
import { useTransferEntityControl } from "@mycelium-ip/react";

function TransferControl({ entityPubkey }: { entityPubkey: PublicKey }) {
  const { mutate } = useTransferEntityControl();

  const handleTransfer = () => {
    mutate({
      entity: entityPubkey,
      newController: newControllerPubkey,
    });
  };

  return <button onClick={handleTransfer}>Transfer Control</button>;
}
```

### IP Hooks

#### useCreateIp

Creates a new IP (Intellectual Property) asset.

```tsx
import { useCreateIp } from "@mycelium-ip/react";

function CreateIp({ entityPubkey }: { entityPubkey: PublicKey }) {
  const { mutate, isPending } = useCreateIp();

  const handleCreate = () => {
    mutate({
      registrantEntity: entityPubkey,
      content: new TextEncoder().encode("ipfs://QmXxx..."), // Content identifier
      treasuryTokenAccount: treasuryAccount, // Protocol treasury token account
      payerTokenAccount: payerAccount, // Payer's token account for fees
    });
  };

  return <button onClick={handleCreate}>Register IP</button>;
}
```

#### useTransferIp

Transfers ownership of an IP to another entity.

```tsx
import { useTransferIp } from "@mycelium-ip/react";

function TransferIp({ ipPubkey, currentOwner, newOwner }: Props) {
  const { mutate } = useTransferIp();

  const handleTransfer = () => {
    mutate({
      ip: ipPubkey,
      currentOwnerEntity: currentOwner,
      newOwnerEntity: newOwner,
      controllerSigners: [controller1], // required when entity has multiple controllers
    });
  };

  return <button onClick={handleTransfer}>Transfer IP</button>;
}
```

### License Hooks

#### useCreateLicense

Creates a license for an IP.

```tsx
import { useCreateLicense } from "@mycelium-ip/react";

function CreateLicense({ ipPubkey, entityPubkey }: Props) {
  const { mutate } = useCreateLicense();

  const handleCreate = () => {
    mutate({
      originIp: ipPubkey,
      ownerEntity: entityPubkey,
      derivativesAllowed: true, // Whether derivatives can be created under this license
    });
  };

  return <button onClick={handleCreate}>Create License</button>;
}
```

#### useUpdateLicense

Updates an existing license.

```tsx
import { useUpdateLicense } from "@mycelium-ip/react";

function UpdateLicense({ ipPubkey, entityPubkey }: Props) {
  const { mutate } = useUpdateLicense();

  const handleUpdate = () => {
    mutate({
      originIp: ipPubkey,
      authorityEntity: entityPubkey,
      derivativesAllowed: false,
    });
  };

  return <button onClick={handleUpdate}>Update License</button>;
}
```

#### useRevokeLicense

Revokes a license.

```tsx
import { useRevokeLicense } from "@mycelium-ip/react";

function RevokeLicense({ ipPubkey, entityPubkey }: Props) {
  const { mutate } = useRevokeLicense();

  const handleRevoke = () => {
    mutate({
      originIp: ipPubkey,
      authorityEntity: entityPubkey,
    });
  };

  return <button onClick={handleRevoke}>Revoke License</button>;
}
```

### Grant Hooks

#### useCreateLicenseGrant

Creates a license grant for another entity.

```tsx
import { useCreateLicenseGrant } from "@mycelium-ip/react";

function CreateGrant({ ipPubkey, authorityEntity, granteeEntity }: Props) {
  const { mutate } = useCreateLicenseGrant();

  const handleGrant = () => {
    mutate({
      originIp: ipPubkey,
      authorityEntity: authorityEntity,
      granteeEntity: granteeEntity,
      expiration: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
    });
  };

  return <button onClick={handleGrant}>Grant License</button>;
}
```

#### useRevokeLicenseGrant

Revokes a license grant.

```tsx
import { useRevokeLicenseGrant } from "@mycelium-ip/react";

function RevokeGrant({ ipPubkey, authorityEntity, granteeEntity }: Props) {
  const { mutate } = useRevokeLicenseGrant();

  const handleRevoke = () => {
    mutate({
      originIp: ipPubkey,
      authorityEntity: authorityEntity,
      granteeEntity: granteeEntity,
    });
  };

  return <button onClick={handleRevoke}>Revoke Grant</button>;
}
```

### Derivative Hooks

#### useCreateDerivativeLink

Creates a derivative link between two IPs.

```tsx
import { useCreateDerivativeLink } from "@mycelium-ip/react";

function CreateDerivative({ parentIp, childIp, childOwner }: Props) {
  const { mutate } = useCreateDerivativeLink();

  const handleCreate = () => {
    mutate({
      parentIp: parentIp,
      childIp: childIp,
      childOwnerEntity: childOwner,
      licenseGrant: grantPubkey,
      license: licensePubkey,
    });
  };

  return <button onClick={handleCreate}>Link Derivative</button>;
}
```

#### useUpdateDerivativeLicense

Updates the license on a derivative link.

```tsx
import { useUpdateDerivativeLicense } from "@mycelium-ip/react";

function UpdateDerivativeLicense({ parentIp, childIp, childOwner }: Props) {
  const { mutate } = useUpdateDerivativeLicense();

  const handleUpdate = () => {
    mutate({
      parentIp: parentIp,
      childIp: childIp,
      childOwnerEntity: childOwner,
      newLicenseGrant: newGrantPubkey,
      newLicense: newLicensePubkey,
    });
  };

  return <button onClick={handleUpdate}>Update Derivative License</button>;
}
```

### Metadata Hooks

#### useCreateMetadataSchema

Creates a new metadata schema.

```tsx
import { useCreateMetadataSchema } from "@mycelium-ip/react";

function CreateSchema() {
  const { mutate } = useCreateMetadataSchema();

  const handleCreate = () => {
    mutate({
      id: new TextEncoder().encode("artwork-schema"),
      version: 1,
      data: new TextEncoder().encode(
        JSON.stringify({
          type: "object",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
          },
        }),
      ),
      cid: new TextEncoder().encode("ipfs://QmSchema..."),
    });
  };

  return <button onClick={handleCreate}>Create Schema</button>;
}
```

#### useCreateEntityMetadata

Creates metadata for an entity.

```tsx
import { useCreateEntityMetadata } from "@mycelium-ip/react";

function CreateEntityMetadata({ entityPubkey, schemaPubkey }: Props) {
  const { mutate } = useCreateEntityMetadata();

  const handleCreate = () => {
    mutate({
      entity: entityPubkey,
      schema: schemaPubkey,
      revision: 1,
      data: new TextEncoder().encode(JSON.stringify({ name: "My Org" })),
      cid: new TextEncoder().encode("ipfs://QmMetadata..."),
    });
  };

  return <button onClick={handleCreate}>Add Metadata</button>;
}
```

#### useCreateIpMetadata

Creates metadata for an IP.

```tsx
import { useCreateIpMetadata } from "@mycelium-ip/react";

function CreateIpMetadata({ ipPubkey, entityPubkey, schemaPubkey }: Props) {
  const { mutate } = useCreateIpMetadata();

  const handleCreate = () => {
    mutate({
      ip: ipPubkey,
      ownerEntity: entityPubkey,
      schema: schemaPubkey,
      revision: 1,
      data: new TextEncoder().encode(
        JSON.stringify({
          title: "My Artwork",
          artist: "Anonymous",
        }),
      ),
      cid: new TextEncoder().encode("ipfs://QmIpMetadata..."),
    });
  };

  return <button onClick={handleCreate}>Add IP Metadata</button>;
}
```

### Composite Hooks

These hooks bundle multiple on-chain instructions into a **single atomic transaction**, reducing network round-trips and guaranteeing that both operations succeed or fail together.

#### useCreateEntityWithMetadata

Creates a new entity and attaches metadata in one transaction. The entity PDA is derived automatically from the caller's wallet public key and the provided `handle`.

```tsx
import { useCreateEntityWithMetadata } from "@mycelium-ip/react";

function CreateEntityWithMetadata({
  schemaPubkey,
}: {
  schemaPubkey: PublicKey;
}) {
  const { mutate, isPending, isSuccess, data } = useCreateEntityWithMetadata();

  const handleCreate = () => {
    mutate({
      entity: {
        handle: "my-organization",
        additionalControllers: [],
        signatureThreshold: 1,
      },
      metadata: {
        schema: schemaPubkey,
        revision: 1n,
        data: new TextEncoder().encode(JSON.stringify({ name: "My Org" })),
        cid: "ipfs://QmMetadata...",
      },
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        {isPending ? "Creating..." : "Create Entity with Metadata"}
      </button>
      {isSuccess && <p>Created entity! Signature: {data.signature}</p>}
    </div>
  );
}
```

The mutation resolves with a `CreateEntityWithMetadataResult`:

```typescript
interface CreateEntityWithMetadataResult {
  signature: string; // Transaction signature
  entityCreated?: EntityCreated; // Decoded EntityCreated event
  entityMetadataCreated?: EntityMetadataCreated; // Decoded EntityMetadataCreated event
}
```

#### useCreateIpWithMetadata

Creates a new IP asset and attaches metadata in one transaction. The IP PDA is derived automatically from `registrantEntity` and the content hash. The `ownerEntity` for the metadata instruction is also inferred from the IP params.

```tsx
import { useCreateIpWithMetadata } from "@mycelium-ip/react";

function CreateIpWithMetadata({
  entityPubkey,
  schemaPubkey,
  treasuryAccount,
  payerAccount,
}: Props) {
  const { mutate, isPending, isSuccess, data } = useCreateIpWithMetadata();

  const handleCreate = () => {
    mutate({
      ip: {
        registrantEntity: entityPubkey,
        content: new TextEncoder().encode("ipfs://QmXxx..."),
        treasuryTokenAccount: treasuryAccount,
        payerTokenAccount: payerAccount,
      },
      metadata: {
        schema: schemaPubkey,
        revision: 1n,
        data: new TextEncoder().encode(
          JSON.stringify({ title: "My Artwork", artist: "Anonymous" }),
        ),
        cid: "ipfs://QmIpMetadata...",
      },
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        {isPending ? "Registering..." : "Register IP with Metadata"}
      </button>
      {isSuccess && <p>Registered IP! Signature: {data.signature}</p>}
    </div>
  );
}
```

The mutation resolves with a `CreateIpWithMetadataResult`:

```typescript
interface CreateIpWithMetadataResult {
  signature: string; // Transaction signature
  ipCreated?: IpCreated; // Decoded IpCreated event
  ipMetadataCreated?: IpMetadataCreated; // Decoded IpMetadataCreated event
}
```

### Accessor Hooks

These hooks provide access to the underlying SDK and context values.

```tsx
import {
  useMyceliumClient,
  useMyceliumConnection,
  useMyceliumWallet,
  useMyceliumContext,
} from "@mycelium-ip/react";

function MyComponent() {
  // Get the core SDK client for direct access
  const client = useMyceliumClient();

  // Get the Solana connection
  const connection = useMyceliumConnection();

  // Get the wallet (StandardWalletWrapper | null)
  const wallet = useMyceliumWallet();

  // Get everything at once
  const { client, connection, wallet, confirmation } = useMyceliumContext();
}
```

## Multi-sig / Controller Signers

Entities with multiple controllers require additional signers to meet the signature threshold. All mutation hooks accept an optional `controllerSigners` field — an array of `PublicKey`s for the entity controllers that must co-sign the transaction.

The `controllerSigners` field is available on:

- `useUpdateEntityControllers`
- `useCreateIp`, `useTransferIp`
- `useCreateEntityMetadata`, `useCreateIpMetadata`
- `useCreateDerivativeLink`, `useUpdateDerivativeLicense`
- `useCreateLicense`, `useUpdateLicense`, `useRevokeLicense`
- `useCreateLicenseGrant`, `useRevokeLicenseGrant`
- `useCreateEntityWithMetadata` (both `entity` and `metadata` params)
- `useCreateIpWithMetadata` (both `ip` and `metadata` params)

```tsx
const { mutate } = useCreateIp();

mutate({
  registrantEntity: entityPubkey,
  contentHash: hash,
  controllerSigners: [controller1, controller2], // additional signers
});
```

For composite hooks, pass `controllerSigners` in each sub-params object:

```tsx
const { mutate } = useCreateEntityWithMetadata();

mutate({
  entity: {
    handle: "my-org",
    controllerSigners: [controller1],
  },
  metadata: {
    schema: schemaPubkey,
    dataHash: hash,
    cid: "ipfs://Qm...",
    controllerSigners: [controller1],
  },
});
```

---

## Transaction Results

All mutation hooks return a `TransactionResult` on success:

```typescript
interface TransactionResult {
  signature: string; // The transaction signature
}
```

### Handling Results

```tsx
function CreateEntityWithFeedback() {
  const { mutate, isPending, isSuccess, isError, data, error } =
    useCreateEntity();

  const handleCreate = () => {
    mutate(
      {
        handle: new TextEncoder().encode("my-entity"),
        additionalControllers: [],
        signatureThreshold: 1,
      },
      {
        onSuccess: (result) => {
          console.log("Transaction signature:", result.signature);
          // Show success toast, redirect, etc.
        },
        onError: (error) => {
          console.error("Transaction failed:", error.message);
          // Show error toast
        },
      },
    );
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        {isPending ? "Creating..." : "Create Entity"}
      </button>
      {isSuccess && <p>Success! Signature: {data.signature}</p>}
      {isError && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Async/Await Pattern

```tsx
async function handleCreateEntity() {
  const { mutateAsync } = useCreateEntity();

  try {
    const result = await mutateAsync({
      handle: new TextEncoder().encode("my-entity"),
      additionalControllers: [],
      signatureThreshold: 1,
    });
    console.log("Created with signature:", result.signature);
  } catch (error) {
    console.error("Failed to create entity:", error);
  }
}
```

## Query Keys

The SDK exports `queryKeys` for custom cache invalidation or building custom queries:

```tsx
import { queryKeys, useMyceliumClient } from "@mycelium-ip/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Available query keys
queryKeys.all; // ["mycelium"]
queryKeys.entities(); // ["mycelium", "entities"]
queryKeys.entity(id); // ["mycelium", "entities", id]
queryKeys.ips(); // ["mycelium", "ips"]
queryKeys.ip(id); // ["mycelium", "ips", id]
queryKeys.licenses(); // ["mycelium", "licenses"]
queryKeys.license(id); // ["mycelium", "licenses", id]
queryKeys.grants(); // ["mycelium", "grants"]
queryKeys.grant(id); // ["mycelium", "grants", id]
queryKeys.metadata(); // ["mycelium", "metadata"]
queryKeys.derivatives(); // ["mycelium", "derivatives"]
queryKeys.derivative(id); // ["mycelium", "derivatives", id]

// Manual cache invalidation
function RefreshButton() {
  const queryClient = useQueryClient();

  return (
    <button
      onClick={() =>
        queryClient.invalidateQueries({ queryKey: queryKeys.ips() })
      }
    >
      Refresh IPs
    </button>
  );
}
```

## Advanced Usage

### Custom QueryClient

Provide your own QueryClient for custom caching behavior:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { MyceliumIpProvider } from "@mycelium-ip/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <MyceliumIpProvider
      connection={connection}
      wallet={wallet}
      queryClient={queryClient}
    >
      <YourApp />
    </MyceliumIpProvider>
  );
}
```

### TypeScript Types

All parameter types are re-exported from `@mycelium-ip/core-sdk`:

```typescript
import type {
  CreateEntityParams,
  CreateIpParams,
  CreateLicenseParams,
  CreateLicenseGrantParams,
  // ... etc
} from "@mycelium-ip/core-sdk";
```

### Next.js App Router

The provider is already marked with `"use client"`. In Next.js App Router, create a client component for the provider:

```tsx
// app/providers.tsx
"use client";

import { MyceliumIpProvider } from "@mycelium-ip/react";
// ... wallet setup

export function Providers({ children }: { children: React.ReactNode }) {
  // ... setup logic
  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      {children}
    </MyceliumIpProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## API Reference

### Exports

```typescript
// Provider
export { MyceliumIpProvider } from "@mycelium-ip/react";
export type {
  MyceliumIpProviderProps,
  MyceliumIpProviderOptions,
  MyceliumContextValue,
} from "@mycelium-ip/react";

// Wallet types (re-exported from @mycelium-ip/core-sdk)
export type {
  StandardWalletWrapper,
  UnsupportedFeatureError,
} from "@mycelium-ip/react";

// Transaction utilities
export {
  clusterToChain,
  executeTransaction,
  executeTransactionWithInstructions,
} from "@mycelium-ip/react";
export type { TransactionResult } from "@mycelium-ip/react";

// Query keys
export { queryKeys } from "@mycelium-ip/react";

// Accessor hooks
export {
  useMyceliumClient,
  useMyceliumConnection,
  useMyceliumWallet,
  useMyceliumContext,
} from "@mycelium-ip/react";

// Entity hooks
export {
  useCreateEntity,
  useUpdateEntityControllers,
  useCreateEntityWithMetadata,
} from "@mycelium-ip/react";
export type {
  CreateEntityWithMetadataParams,
  CreateEntityWithMetadataResult,
} from "@mycelium-ip/react";

// IP hooks
export {
  useCreateIp,
  useTransferIp,
  useCreateIpWithMetadata,
} from "@mycelium-ip/react";
export type {
  CreateIpWithMetadataParams,
  CreateIpWithMetadataResult,
} from "@mycelium-ip/react";

// License hooks
export {
  useCreateLicense,
  useUpdateLicense,
  useRevokeLicense,
} from "@mycelium-ip/react";

// Grant hooks
export {
  useCreateLicenseGrant,
  useRevokeLicenseGrant,
} from "@mycelium-ip/react";

// Derivative hooks
export {
  useCreateDerivativeLink,
  useUpdateDerivativeLicense,
} from "@mycelium-ip/react";

// Metadata hooks
export {
  useCreateMetadataSchema,
  useCreateEntityMetadata,
  useCreateIpMetadata,
} from "@mycelium-ip/react";
```

## License

MIT
