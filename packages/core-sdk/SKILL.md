---
name: core-sdk
description: >
  **INTEGRATION SKILL** — Use `@mycelium-ip/core-sdk` to interact with the
  Mycelium IP protocol on Solana. USE FOR: creating entities, registering IP,
  licensing, derivatives, metadata, PDA derivation,
  building custom instruction pipelines on Solana. DO NOT USE FOR: React
  component integration (use the @mycelium-ip/react skill instead).
---

# @mycelium-ip/core-sdk Integration Guide

TypeScript SDK for the Mycelium IP protocol on Solana. Wraps Anchor
provider/program setup, PDA derivation, instruction creation, and transaction
submission.

## Installation

```bash
pnpm add @mycelium-ip/core-sdk
# Peer dependencies are bundled; no extra installs needed.
```

Key dependencies: `@coral-xyz/anchor`, `@solana/web3.js`,
`@wallet-standard/base`, `@solana/wallet-standard-features`.

---

## Client Initialization

### Browser / Next.js

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient } from "@mycelium-ip/core-sdk";
import type { Wallet } from "@wallet-standard/base";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const sdk = new MyceliumClient({
  connection,
  wallet, // Wallet Standard–compliant
  cluster: "devnet", // "devnet" | "mainnet-beta"
  confirmOptions: { commitment: "confirmed" },
});
```

### Node.js / Testing (Keypair wallet)

```ts
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { MyceliumClient } from "@mycelium-ip/core-sdk";
import type { Wallet, WalletAccount } from "@wallet-standard/base";

const payer = Keypair.generate();
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const account: WalletAccount = {
  address: payer.publicKey.toBase58(),
  publicKey: payer.publicKey.toBytes(),
  chains: ["solana:devnet"],
  features: ["solana:signTransaction"],
};

const wallet: Wallet = {
  version: "1.0.0",
  name: "Node Keypair Wallet",
  icon: "data:image/svg+xml;base64," as any,
  chains: ["solana:devnet"],
  accounts: [account],
  features: {
    "solana:signTransaction": {
      version: "1.0.0",
      supportedTransactionVersions: ["legacy", 0],
      signTransaction: async (...inputs) =>
        inputs.map(({ transaction }) => {
          const tx = Transaction.from(transaction);
          tx.partialSign(payer);
          return { signedTransaction: new Uint8Array(tx.serialize()) };
        }),
    },
  },
};

const sdk = new MyceliumClient({ connection, wallet });
```

### Wallet Requirements

| Feature                         | Required | Notes                            |
| ------------------------------- | -------- | -------------------------------- |
| `solana:signTransaction`        | **Yes**  | Throws `UnsupportedFeatureError` |
| `solana:signAndSendTransaction` | No       | Preferred when available         |
| `solana:signMessage`            | No       | Optional                         |

The wallet must have **at least one account** (`wallet.accounts[0]`).

### Type Guard

```ts
import { isStandardWallet } from "@mycelium-ip/core-sdk";
if (isStandardWallet(unknownValue)) {
  const sdk = new MyceliumClient({ connection, wallet: unknownValue });
}
```

### Switching Wallets

Swap the active wallet without reconstructing the client:

```ts
sdk.setWallet(newWallet);
// All modules immediately use the new wallet for signing.
```

`setWallet(wallet, accountIndex?)` validates the new wallet (requires
`solana:signTransaction` and at least one account), then mutates the internal
`StandardWalletWrapper` in-place. The `AnchorProvider` and `Program` instances
are reused — only the signing identity changes.

---

## Client Hierarchy

```
MyceliumClient
├── wallet: StandardWalletWrapper
├── ipCore: IpCoreClient
│   ├── entity     → create, transferControl
│   ├── ip         → create, transfer
│   ├── metadata   → createSchema, createEntityMetadata, createIpMetadata
│   ├── derivative → create, updateLicense
│   ├── fetch*     → fetchConfig, fetchEntity, fetchEntityCount,
│   │                fetchCreatorEntityCounter, fetchIp,
│   │                fetchDerivativeLink, fetchMetadata, fetchMetadataSchema
│   ├── find*      → findEntities, findIps, findDerivativeLinks, findMetadata
│   ├── derive*    → deriveEntityAddress, deriveCounterAddress, deriveIpAddress,
│   │                deriveEntityMetadataAddress, deriveIpMetadataAddress,
│   │                deriveConfigAddress
│   └── events     → parseEvent, parseEvents, findEventByName
└── license: LicenseClient
    ├── license    → create, update, revoke
    ├── grant      → create, revoke
    ├── fetch*     → fetchLicense, fetchLicenseGrant
    ├── find*      → findLicenses, findLicenseGrants
    └── events     → parseEvent, parseEvents, findEventByName
```

---

## Two Usage Patterns

Every module method comes in two flavours:

### Pattern A — Instruction builder (`*Ix`)

Returns a `TransactionInstruction` you can compose into your own transaction.

```ts
const ix = await sdk.ipCore.entity.createIx({});
// Add ix to a custom Transaction
```

### Pattern B — Transaction sender (no `Ix` suffix)

Builds, signs, sends, confirms, and returns a `TransactionResult<Event>`.

```ts
const result = await sdk.ipCore.entity.create({});
console.log(result.signature); // tx sig
console.log(result.event); // decoded EntityCreated event
console.log(result.event.index); // sequential entity index (bigint)
```

---

## Module API Reference

### Entity (`sdk.ipCore.entity`)

```ts
// Create — entity index is auto-assigned from the on-chain counter
const result = await sdk.ipCore.entity.create({
  creator: walletPubkey, // optional, defaults to wallet
});
// result.event.index — the assigned entity index (bigint)

// Transfer entity control
await sdk.ipCore.entity.transferControl({
  entity: entityPda,
  newController: newControllerPubkey,
  controller: existingController, // optional, defaults to wallet
});
```

#### Entity counter & PDA derivation

Each creator has a `CreatorEntityCounter` PDA tracking how many entities
they have created. The SDK fetches this counter automatically during entity
creation. You can also query it directly:

```ts
// Get the current entity count (next index that will be assigned)
const count = await sdk.ipCore.fetchEntityCount(creatorPubkey);

// Derive the entity PDA for a specific index
const entityAddress = sdk.ipCore.deriveEntityAddress(creatorPubkey, count);

// Derive the counter PDA
const counterAddress = sdk.ipCore.deriveCounterAddress(creatorPubkey);

// Fetch the full counter account
const counter = await sdk.ipCore.fetchCreatorEntityCounter(creatorPubkey);
// counter?.entityCount — bigint
```

### IP (`sdk.ipCore.ip`)

```ts
// Create — contentHash must be a 32-byte SHA-256 digest
await sdk.ipCore.ip.create({
  registrantEntity: entityPda,
  contentHash: sha256Hash(new TextEncoder().encode("ipfs://Qm...")),
  treasuryTokenAccount: treasuryAta, // optional; omitted when fee is 0, derived from config otherwise
  payerTokenAccount: payerAta, // optional; omitted when fee is 0, derived as payer ATA otherwise
});

// Transfer
await sdk.ipCore.ip.transfer({
  ip: ipPda,
  currentOwnerEntity: entityA,
  newOwnerEntity: entityB,
  controller: controllerOfEntityA, // optional, defaults to wallet
});
```

### Metadata (`sdk.ipCore.metadata`)

```ts
// Create schema
await sdk.ipCore.metadata.createSchema({
  id: "artwork-v1",
  version: "1",
  dataHash: sha256Hash(schemaBytes),
  cid: "ipfs://QmSchema...",
});

// Entity metadata
await sdk.ipCore.metadata.createEntityMetadata({
  entity: entityPda,
  schema: schemaPda,
  dataHash: sha256Hash(metadataBytes),
  cid: "ipfs://QmMeta...",
});

// IP metadata
await sdk.ipCore.metadata.createIpMetadata({
  ip: ipPda,
  ownerEntity: entityPda,
  schema: schemaPda,
  dataHash: sha256Hash(metadataBytes),
  cid: "ipfs://QmIpMeta...",
});
```

### Derivatives (`sdk.ipCore.derivative`)

```ts
// Create derivative link
await sdk.ipCore.derivative.create({
  parentIp: parentIpPda,
  childIp: childIpPda,
  childOwnerEntity: childEntityPda,
  licenseGrant: grantPda,
  license: licensePda,
});

// Update derivative license
await sdk.ipCore.derivative.updateLicense({
  parentIp: parentIpPda,
  childIp: childIpPda,
  childOwnerEntity: childEntityPda,
  newLicenseGrant: newGrantPda,
  newLicense: newLicensePda,
});
```

### License (`sdk.license.license`)

```ts
await sdk.license.license.create({
  originIp: ipPda,
  ownerEntity: entityPda,
  derivativesAllowed: true,
});

await sdk.license.license.update({
  originIp: ipPda,
  authorityEntity: entityPda,
  derivativesAllowed: false,
});

await sdk.license.license.revoke({
  originIp: ipPda,
  authorityEntity: entityPda,
});
```

### License Grants (`sdk.license.grant`)

```ts
await sdk.license.grant.create({
  originIp: ipPda,
  authorityEntity: entityPda,
  granteeEntity: granteePda,
  expiration: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
});

await sdk.license.grant.revoke({
  originIp: ipPda,
  authorityEntity: entityPda,
  granteeEntity: granteePda,
});
```

---

## Account Fetching

Fetch a single on-chain account by its PDA. Every method returns
`null` when the account does not exist.

### `sdk.ipCore` fetchers

```ts
// Protocol config (treasury, registration fee, etc.)
const config = await sdk.ipCore.fetchConfig();
// config.authority, config.treasury, config.registrationCurrency, …

// Entity
const entity = await sdk.ipCore.fetchEntity(entityPda);
// entity?.creator, entity?.index (bigint), entity?.controller, …

// IP
const ip = await sdk.ipCore.fetchIp(ipPda);
// ip?.contentHash, ip?.currentOwnerEntity, …

// Derivative link
const link = await sdk.ipCore.fetchDerivativeLink(derivativeLinkPda);
// link?.parentIp, link?.childIp, link?.license, …

// Metadata
const meta = await sdk.ipCore.fetchMetadata(metadataPda);
// meta?.schema, meta?.hash, meta?.cid, meta?.parent, …

// Metadata schema
const schema = await sdk.ipCore.fetchMetadataSchema(schemaPda);
// schema?.id, schema?.version, schema?.hash, schema?.cid, …
```

`fetchEntityCount` and `fetchCreatorEntityCounter` are documented in the
Entity section above.

### `sdk.license` fetchers

```ts
const license = await sdk.license.fetchLicense(licensePda);
// license?.originIp, license?.authority, license?.derivativesAllowed, …

const grant = await sdk.license.fetchLicenseGrant(grantPda);
// grant?.license, grant?.grantee, grant?.expiration (bigint), …
```

---

## Account Queries

Query multiple accounts with optional filtering and pagination.
All `find*` methods return `PaginatedResult<AccountWithPublicKey<T>>`:

```ts
// { items: [{ publicKey: PublicKey, account: T }, …], hasMore: boolean }
```

Pagination defaults: `limit = 20`, `offset = 0`.

### `sdk.ipCore` queries

```ts
// Find entities — filter by creator, index, or controller
const entities = await sdk.ipCore.findEntities(
  { creator: walletPubkey }, // EntityFilter (all fields optional)
  { limit: 10, offset: 0 }, // PaginationOptions (optional)
);

// Find IPs — filter by contentHash, registrantEntity, or currentOwnerEntity
const ips = await sdk.ipCore.findIps(
  { currentOwnerEntity: entityPda }, // IpFilter
);

// Find derivative links — filter by parentIp, childIp, or license
const links = await sdk.ipCore.findDerivativeLinks(
  { parentIp: ipPda }, // DerivativeLinkFilter
);

// Find metadata — filter by parent or parentType ("entity" | "ip")
const metadata = await sdk.ipCore.findMetadata(
  { parent: entityPda, parentType: "entity" }, // MetadataFilter
);
```

### `sdk.license` queries

```ts
// Find licenses — filter by originIp or authority
const licenses = await sdk.license.findLicenses(
  { originIp: ipPda }, // LicenseFilter
);

// Find license grants — filter by license or grantee
const grants = await sdk.license.findLicenseGrants(
  { license: licensePda }, // LicenseGrantFilter
);
```

---

## Event Parsing

Both `sdk.ipCore` and `sdk.license` expose event-parsing helpers for
extracting decoded Anchor events from confirmed transactions.

```ts
// Parse the first event (convenience for single-event transactions)
const event = await sdk.ipCore.parseEvent<EntityCreated>(connection, signature);

// Parse all events from a transaction
const events = await sdk.ipCore.parseEvents(connection, signature);

// Find a specific event by camelCase name
const created = sdk.ipCore.findEventByName<EntityCreated>(
  events,
  "entityCreated",
);

// Works identically on the license client
const licenseEvents = await sdk.license.parseEvents(connection, signature);
const revoked = sdk.license.findEventByName<LicenseRevoked>(
  licenseEvents,
  "licenseRevoked",
);
```

---

## PDA Helpers

Derive on-chain addresses deterministically without making RPC calls:

```ts
import {
  deriveEntityPda,
  deriveCreatorEntityCounterPda,
  deriveIpPda,
  deriveMetadataSchemaPda,
  deriveEntityMetadataPda,
  deriveIpMetadataPda,
  deriveLicensePda,
  deriveLicenseGrantPda,
  deriveDerivativeLinkPda,
} from "@mycelium-ip/core-sdk";
```

`IpCoreClient` also exposes convenience instance methods so you don't need
to pass the `programId` manually:

```ts
// Entity / counter (also shown in the Entity section)
sdk.ipCore.deriveEntityAddress(creator, index); // → PublicKey
sdk.ipCore.deriveCounterAddress(creator); // → PublicKey

// IP
sdk.ipCore.deriveIpAddress(registrantEntity, contentHash); // → PublicKey

// Metadata
sdk.ipCore.deriveEntityMetadataAddress(entity, revision); // → PublicKey
sdk.ipCore.deriveIpMetadataAddress(ip, revision); // → PublicKey

// Protocol config
sdk.ipCore.deriveConfigAddress(); // → PublicKey
```

---

## Byte / Hash Utilities

```ts
import {
  sha256Hash, // sha256Hash(data: Uint8Array): Uint8Array
  toFixedBytes, // toFixedBytes(value, byteLength, label): number[]
  utf8Bytes, // utf8Bytes(value: string): Uint8Array
  normalizeBytes, // normalizeBytes(value: StringOrBytes): Uint8Array
  toU64Bn, // BigNumber conversion helpers
  toI64Bn,
  u64SeedBytes,
} from "@mycelium-ip/core-sdk";
```

`StringOrBytes` = `string | Uint8Array | number[]`. The SDK normalises
transparently.

---

## Controller

Most mutation params accept an optional `controller?: PublicKey` that
identifies the entity controller authorising the operation. When omitted it
defaults to the connected wallet's public key.

```ts
// Explicit controller (when it differs from the connected wallet)
await sdk.ipCore.ip.transfer({
  ip: ipPda,
  currentOwnerEntity: entityA,
  newOwnerEntity: entityB,
  controller: otherControllerPubkey,
});

// Omitted — wallet is used automatically
await sdk.ipCore.ip.transfer({
  ip: ipPda,
  currentOwnerEntity: entityA,
  newOwnerEntity: entityB,
});
```

---

## Error Handling

All errors extend `MyceliumError` with a `.code` discriminant:

| Error Class                     | Code                         | When                                    |
| ------------------------------- | ---------------------------- | --------------------------------------- |
| `TokenAccountNotFoundError`     | `TOKEN_ACCOUNT_NOT_FOUND`    | ATA doesn't exist on-chain              |
| `InsufficientTokenBalanceError` | `INSUFFICIENT_TOKEN_BALANCE` | Payer balance < registration fee        |
| `EntityNotFoundError`           | `ENTITY_NOT_FOUND`           | Entity PDA doesn't exist                |
| `AccountNotFoundError`          | `ACCOUNT_NOT_FOUND`          | Generic account not found on-chain      |
| `UnsupportedFeatureError`       | (wallet module)              | Wallet missing `solana:signTransaction` |

```ts
import { MyceliumError, EntityNotFoundError } from "@mycelium-ip/core-sdk";

try {
  await sdk.ipCore.ip.create({ ... });
} catch (err) {
  if (err instanceof EntityNotFoundError) {
    console.error("Create the entity first:", err.entity.toBase58());
  }
}
```

---

## Key Types

```ts
import type {
  // Client
  MyceliumClientOptions,
  MyceliumCluster, // "devnet" | "mainnet-beta"
  TransactionResult, // { signature: string; event: E }
  SendTxOptions,
  StringOrBytes,

  // Transaction params
  CreateEntityParams,
  TransferEntityControlParams,
  CreateIpParams,
  TransferIpParams,
  CreateMetadataSchemaParams,
  CreateEntityMetadataParams,
  CreateIpMetadataParams,
  CreateDerivativeLinkParams,
  UpdateDerivativeLicenseParams,
  CreateLicenseParams,
  UpdateLicenseParams,
  RevokeLicenseParams,
  CreateLicenseGrantParams,
  RevokeLicenseGrantParams,

  // On-chain account types
  ProtocolConfig,
  EntityAccount,
  CreatorEntityCounterAccount,
  IpAccount,
  DerivativeLinkAccount,
  MetadataAccount,
  MetadataSchemaAccount,
  LicenseAccount,
  LicenseGrantAccount,

  // Query types
  EntityFilter,
  IpFilter,
  DerivativeLinkFilter,
  MetadataFilter,
  LicenseFilter,
  LicenseGrantFilter,
  PaginationOptions, // { limit?: number; offset?: number }
  PaginatedResult, // { items: T[]; hasMore: boolean }
  AccountWithPublicKey, // { publicKey: PublicKey; account: T }

  // Event parsing
  ParsedEvent,
} from "@mycelium-ip/core-sdk";
```

---

## Program IDs & Constants

```ts
import { PROGRAM_IDS, getProgramIds, PDA_SEEDS } from "@mycelium-ip/core-sdk";

const ids = getProgramIds("devnet"); // { ipCore: PublicKey, license: PublicKey }
```

---

## Common Pitfalls

1. **Empty accounts array** — `wallet.accounts` must have ≥1 entry; throws at
   construction otherwise.
2. **Missing `solana:signTransaction`** — Required wallet feature; throws
   `UnsupportedFeatureError`.
3. **Controller default** — `controller` defaults to the connected wallet.
   Pass an explicit `controller` PublicKey only when the entity controller
   differs from the wallet.
4. **Content hash** — `CreateIpParams.contentHash` expects a 32-byte SHA-256
   digest. Use `sha256Hash()` from this package.
5. **`cluster` default** — Defaults to `"devnet"`. Set explicitly for
   mainnet-beta.
6. **Token accounts** — When the protocol registration fee is 0, token
   accounts are not required and the SDK omits them automatically. When the
   fee is non-zero, `treasuryTokenAccount` / `payerTokenAccount` are derived
   from on-chain config if omitted. Ensure the accounts exist and the payer
   has sufficient balance.

---

## Full Workflow Example

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient, sha256Hash } from "@mycelium-ip/core-sdk";

const sdk = new MyceliumClient({ connection, wallet, cluster: "devnet" });

// 1. Create entity
const entityResult = await sdk.ipCore.entity.create({});
// entityResult.event.index — the auto-assigned entity index

// 2. Create metadata schema
const schemaResult = await sdk.ipCore.metadata.createSchema({
  id: "artwork-v1",
  version: "1",
  dataHash: sha256Hash(schemaBytes),
  cid: "ipfs://QmSchema...",
});

// 3. Add entity metadata
await sdk.ipCore.metadata.createEntityMetadata({
  entity: entityResult.event.entity,
  schema: schemaResult.event.metadataSchema,
  dataHash: sha256Hash(entityMetaBytes),
  cid: "ipfs://QmEntityMeta...",
});

// 4. Register IP
const ipResult = await sdk.ipCore.ip.create({
  registrantEntity: entityResult.event.entity,
  contentHash: sha256Hash(contentBytes),
});

// 5. Create license
await sdk.license.license.create({
  originIp: ipResult.event.ip,
  ownerEntity: entityResult.event.entity,
  derivativesAllowed: true,
});

// 6. Grant license to another entity
await sdk.license.grant.create({
  originIp: ipResult.event.ip,
  authorityEntity: entityResult.event.entity,
  granteeEntity: otherEntityPda,
  expiration: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
});
```
