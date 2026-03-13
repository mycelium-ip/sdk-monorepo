---
name: mycelium-react-sdk
description: >
  **INTEGRATION SKILL** — Use `@mycelium-ip/react` to integrate the Mycelium IP
  protocol into React/Next.js apps. USE FOR: provider setup, entity/IP/license/
  derivative/metadata mutations via React hooks, wallet integration (Wallet
  Standard, Solana Wallet Adapter, Privy), TanStack Query cache management,
  multi-sig transactions in UI components. DO NOT USE FOR: server-side or
  non-React usage (use the @mycelium-ip/core-sdk skill instead).
applyTo: "**/*.{tsx,jsx}"
---

# @mycelium-ip/react Integration Guide

React hooks for the Mycelium IP protocol. Thin wrapper over
`@mycelium-ip/core-sdk` powered by TanStack Query.

## Installation

```bash
pnpm add @mycelium-ip/react @mycelium-ip/core-sdk

# Peer dependencies
pnpm add @solana/web3.js @tanstack/react-query react
```

---

## Provider Setup

Wrap your app (or the subtree that uses Mycelium hooks) with
`MyceliumIpProvider`. It initialises the core SDK client and provides TanStack
Query context.

```tsx
import { Connection } from "@solana/web3.js";
import { MyceliumIpProvider } from "@mycelium-ip/react";
import type { Wallet } from "@wallet-standard/base";

function App() {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet: Wallet = useYourWallet(); // Any Wallet Standard–compliant wallet

  return (
    <MyceliumIpProvider
      connection={connection}
      wallet={wallet}
      options={{
        confirmation: "confirmed", // "processed" | "confirmed" | "finalized"
        cluster: "devnet", // "devnet" | "mainnet-beta"
      }}
    >
      <YourApp />
    </MyceliumIpProvider>
  );
}
```

### Provider Props

| Prop                 | Type                        | Required | Description                                          |
| -------------------- | --------------------------- | -------- | ---------------------------------------------------- |
| `connection`         | `Connection`                | Yes      | Solana RPC connection                                |
| `wallet`             | `Wallet \| null`            | No       | Wallet Standard wallet. Mutations throw when null    |
| `queryClient`        | `QueryClient`               | No       | Existing TanStack Query client                       |
| `executeTransaction` | `TransactionExecutor`       | No       | Custom sign+send function (e.g. Privy sponsored txs) |
| `options`            | `MyceliumIpProviderOptions` | No       | `{ confirmation?, cluster? }`                        |

The provider is marked `"use client"` — safe for Next.js App Router.

---

## Wallet Integration Patterns

### Solana Wallet Adapter

```tsx
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { MyceliumIpProvider } from "@mycelium-ip/react";
import { isStandardWallet } from "@mycelium-ip/core-sdk";

function MyceliumProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { wallet } = useWallet();

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

```tsx
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { MyceliumIpProvider } from "@mycelium-ip/react";
import { isStandardWallet } from "@mycelium-ip/core-sdk";

function MyceliumPrivyProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const embeddedWallet = wallets[0];
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
```

---

## Hook Categories & API

All mutation hooks return TanStack Query's `UseMutationResult`:
`mutate`, `mutateAsync`, `isPending`, `isSuccess`, `isError`, `data`, `error`,
`reset`.

On success, `data` is a `TransactionResult` with `{ signature: string }`.

### Entity Hooks

#### `useCreateEntity`

```tsx
import { useCreateEntity } from "@mycelium-ip/react";

const { mutate, isPending } = useCreateEntity();
mutate({
  handle: new TextEncoder().encode("my-entity"), // string or Uint8Array
  additionalControllers: [], // PublicKey[]
  signatureThreshold: 1,
});
```

#### `useUpdateEntityControllers`

```tsx
import { useUpdateEntityControllers } from "@mycelium-ip/react";

const { mutate } = useUpdateEntityControllers();
mutate({
  entity: entityPubkey,
  newControllers: [controller1, controller2],
  newThreshold: 2,
  controllerSigners: [existingController],
});
```

#### `useCreateEntityWithMetadata` (composite — single atomic transaction)

Creates entity + attaches metadata in **one atomic transaction**. Entity PDA is
derived automatically from the caller's wallet and the provided handle.

```tsx
import { useCreateEntityWithMetadata } from "@mycelium-ip/react";
import { sha256Hash } from "@mycelium-ip/core-sdk";

const { mutate, data } = useCreateEntityWithMetadata();
mutate({
  entity: {
    handle: "my-organization",
    additionalControllers: [],
    signatureThreshold: 1,
  },
  metadata: {
    schema: schemaPubkey,
    revision: 1n,
    dataHash: sha256Hash(
      new TextEncoder().encode(JSON.stringify({ name: "My Org" })),
    ),
    cid: "ipfs://QmMetadata...",
  },
});
// data: { signature, entityCreated?, entityMetadataCreated? }
```

### IP Hooks

#### `useCreateIp`

```tsx
import { useCreateIp } from "@mycelium-ip/react";

const { mutate } = useCreateIp();
mutate({
  registrantEntity: entityPubkey,
  contentHash: sha256Hash(new TextEncoder().encode("ipfs://Qm...")),
  treasuryTokenAccount: treasuryAccount,
  payerTokenAccount: payerAccount,
});
```

#### `useTransferIp`

```tsx
import { useTransferIp } from "@mycelium-ip/react";

const { mutate } = useTransferIp();
mutate({
  ip: ipPubkey,
  currentOwnerEntity: currentOwner,
  newOwnerEntity: newOwner,
  controllerSigners: [controller1],
});
```

#### `useCreateIpWithMetadata` (composite — single atomic transaction)

Creates IP + attaches metadata in **one atomic transaction**. IP PDA is derived
automatically.

```tsx
import { useCreateIpWithMetadata } from "@mycelium-ip/react";
import { sha256Hash } from "@mycelium-ip/core-sdk";

const { mutate, data } = useCreateIpWithMetadata();
mutate({
  ip: {
    registrantEntity: entityPubkey,
    contentHash: sha256Hash(contentBytes),
    treasuryTokenAccount: treasuryAccount,
    payerTokenAccount: payerAccount,
  },
  metadata: {
    schema: schemaPubkey,
    revision: 1n,
    dataHash: sha256Hash(metadataBytes),
    cid: "ipfs://QmIpMetadata...",
  },
});
// data: { signature, ipCreated?, ipMetadataCreated? }
```

### License Hooks

#### `useCreateLicense`

```tsx
import { useCreateLicense } from "@mycelium-ip/react";

const { mutate } = useCreateLicense();
mutate({
  originIp: ipPubkey,
  ownerEntity: entityPubkey,
  derivativesAllowed: true,
});
```

#### `useUpdateLicense`

```tsx
import { useUpdateLicense } from "@mycelium-ip/react";

const { mutate } = useUpdateLicense();
mutate({
  originIp: ipPubkey,
  authorityEntity: entityPubkey,
  derivativesAllowed: false,
});
```

#### `useRevokeLicense`

```tsx
import { useRevokeLicense } from "@mycelium-ip/react";

const { mutate } = useRevokeLicense();
mutate({ originIp: ipPubkey, authorityEntity: entityPubkey });
```

### Grant Hooks

#### `useCreateLicenseGrant`

```tsx
import { useCreateLicenseGrant } from "@mycelium-ip/react";

const { mutate } = useCreateLicenseGrant();
mutate({
  originIp: ipPubkey,
  authorityEntity: authorityEntity,
  granteeEntity: granteeEntity,
  expiration: Math.floor(Date.now() / 1000) + 86400 * 365,
});
```

#### `useRevokeLicenseGrant`

```tsx
import { useRevokeLicenseGrant } from "@mycelium-ip/react";

const { mutate } = useRevokeLicenseGrant();
mutate({
  originIp: ipPubkey,
  authorityEntity: authorityEntity,
  granteeEntity: granteeEntity,
});
```

### Derivative Hooks

#### `useCreateDerivativeLink`

```tsx
import { useCreateDerivativeLink } from "@mycelium-ip/react";

const { mutate } = useCreateDerivativeLink();
mutate({
  parentIp: parentIpPda,
  childIp: childIpPda,
  childOwnerEntity: childOwner,
  licenseGrant: grantPubkey,
  license: licensePubkey,
});
```

#### `useUpdateDerivativeLicense`

```tsx
import { useUpdateDerivativeLicense } from "@mycelium-ip/react";

const { mutate } = useUpdateDerivativeLicense();
mutate({
  parentIp: parentIpPda,
  childIp: childIpPda,
  childOwnerEntity: childOwner,
  newLicenseGrant: newGrantPubkey,
  newLicense: newLicensePubkey,
});
```

### Metadata Hooks

#### `useCreateMetadataSchema`

```tsx
import { useCreateMetadataSchema } from "@mycelium-ip/react";

const { mutate } = useCreateMetadataSchema();
mutate({
  id: new TextEncoder().encode("artwork-schema"),
  version: 1,
  dataHash: sha256Hash(schemaBytes),
  cid: new TextEncoder().encode("ipfs://QmSchema..."),
});
```

#### `useCreateEntityMetadata`

```tsx
import { useCreateEntityMetadata } from "@mycelium-ip/react";

const { mutate } = useCreateEntityMetadata();
mutate({
  entity: entityPubkey,
  schema: schemaPubkey,
  dataHash: sha256Hash(metadataBytes),
  cid: new TextEncoder().encode("ipfs://QmMeta..."),
});
```

#### `useCreateIpMetadata`

```tsx
import { useCreateIpMetadata } from "@mycelium-ip/react";

const { mutate } = useCreateIpMetadata();
mutate({
  ip: ipPubkey,
  ownerEntity: entityPubkey,
  schema: schemaPubkey,
  dataHash: sha256Hash(metadataBytes),
  cid: new TextEncoder().encode("ipfs://QmIpMeta..."),
});
```

### Accessor Hooks

```tsx
import {
  useMyceliumClient, // MyceliumClient | null
  useMyceliumConnection, // Connection
  useMyceliumWallet, // StandardWalletWrapper | null
  useMyceliumContext, // full context value
} from "@mycelium-ip/react";
```

Use `useMyceliumClient()` to access the core SDK directly for custom
instruction building or account fetches.

---

## Multi-sig / Controller Signers

All mutation hooks that require entity authority accept `controllerSigners:
PublicKey[]`. Pass the public keys of all controllers that must co-sign.

For composite hooks, supply `controllerSigners` in **each** sub-params object:

```tsx
const { mutate } = useCreateEntityWithMetadata();
mutate({
  entity: { handle: "org", controllerSigners: [ctrl1] },
  metadata: { schema, dataHash, cid, controllerSigners: [ctrl1] },
});
```

---

## Query Keys & Cache Invalidation

```tsx
import { queryKeys } from "@mycelium-ip/react";
import { useQueryClient } from "@tanstack/react-query";

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

// Manual invalidation
const qc = useQueryClient();
qc.invalidateQueries({ queryKey: queryKeys.ips() });
```

Mutation hooks already invalidate relevant caches automatically on success.

---

## Transaction Results & Error Handling

```tsx
const { mutate } = useCreateEntity();

mutate(params, {
  onSuccess: (result) => {
    console.log("Signature:", result.signature);
  },
  onError: (error) => {
    console.error("Failed:", error.message);
  },
});

// Or with async/await:
const result = await mutateAsync(params);
```

---

## Transaction Utilities

```tsx
import {
  clusterToChain, // "devnet" → SolanaChain
  executeTransaction, // single instruction
  executeTransactionWithInstructions, // multiple instructions (composite)
  type TransactionResult,
} from "@mycelium-ip/react";
```

Use these when building custom hooks or workflows outside standard mutations.

---

## Next.js App Router Setup

```tsx
// app/providers.tsx
"use client";

import { MyceliumIpProvider } from "@mycelium-ip/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // ... wallet + connection setup
  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      {children}
    </MyceliumIpProvider>
  );
}

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

---

## Custom QueryClient

```tsx
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 60,
      retry: 3,
    },
  },
});

<MyceliumIpProvider
  connection={connection}
  wallet={wallet}
  queryClient={queryClient}
>
  <App />
</MyceliumIpProvider>;
```

---

## Full Workflow Example (React)

```tsx
import {
  useCreateEntity,
  useCreateIp,
  useCreateLicense,
} from "@mycelium-ip/react";
import { sha256Hash } from "@mycelium-ip/core-sdk";

function RegisterIpFlow() {
  const createEntity = useCreateEntity();
  const createIp = useCreateIp();
  const createLicense = useCreateLicense();

  const handleFullFlow = async () => {
    // Step 1: Create entity
    const entityResult = await createEntity.mutateAsync({
      handle: "my-studio",
      additionalControllers: [],
      signatureThreshold: 1,
    });

    // Step 2: Register IP
    const ipResult = await createIp.mutateAsync({
      registrantEntity: entityResult.event.entity,
      contentHash: sha256Hash(new TextEncoder().encode("ipfs://Qm...")),
    });

    // Step 3: Create license
    await createLicense.mutateAsync({
      originIp: ipResult.event.ip,
      ownerEntity: entityResult.event.entity,
      derivativesAllowed: true,
    });
  };

  return (
    <button
      onClick={handleFullFlow}
      disabled={
        createEntity.isPending || createIp.isPending || createLicense.isPending
      }
    >
      Register IP with License
    </button>
  );
}
```

---

## Common Pitfalls

1. **Provider must wrap hooks** — All `use*` hooks must be called inside
   `<MyceliumIpProvider>`.
2. **Null wallet** — Provider accepts `wallet={null}` for unauthenticated
   states, but any mutation will throw. Guard with `isWalletConnected` from the
   hook return.
3. **`"use client"`** — The provider and all hooks are client components.
   In Next.js App Router, import them only in client component files.
4. **Param types from core-sdk** — All parameter interfaces
   (`CreateEntityParams`, `CreateIpParams`, etc.) are exported from
   `@mycelium-ip/core-sdk`, not from this package.
5. **Content hash** — `contentHash` in `useCreateIp` expects a 32-byte
   SHA-256 digest. Use `sha256Hash()` from `@mycelium-ip/core-sdk`.
6. **Composite hooks derive PDAs** — `useCreateEntityWithMetadata` and
   `useCreateIpWithMetadata` derive entity/IP PDAs internally; you do **not**
   need to pre-compute them.
