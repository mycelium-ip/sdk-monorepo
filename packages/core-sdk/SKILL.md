---
name: mycelium-core-sdk
description: >
  **INTEGRATION SKILL** — Use `@mycelium-ip/core-sdk` to interact with the
  Mycelium IP protocol on Solana. USE FOR: creating entities, registering IP,
  licensing, derivatives, metadata, PDA derivation, multi-sig transactions,
  building custom instruction pipelines on Solana. DO NOT USE FOR: React
  component integration (use the @mycelium-ip/react skill instead).
applyTo: "**/*.{ts,tsx,js,jsx}"
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
│   ├── entity     → create, updateControllers
│   ├── ip         → create, transfer
│   ├── metadata   → createSchema, createEntityMetadata, createIpMetadata
│   └── derivative → create, updateLicense
└── license: LicenseClient
    ├── license    → create, update, revoke
    └── grant      → create, revoke
```

---

## Two Usage Patterns

Every module method comes in two flavours:

### Pattern A — Instruction builder (`*Ix`)

Returns a `TransactionInstruction` you can compose into your own transaction.

```ts
const ix = await sdk.ipCore.entity.createIx({
  handle: "my-entity",
  additionalControllers: [],
  signatureThreshold: 1,
});
// Add ix to a custom Transaction
```

### Pattern B — Transaction sender (no `Ix` suffix)

Builds, signs, sends, confirms, and returns a `TransactionResult<Event>`.

```ts
const result = await sdk.ipCore.entity.create({
  handle: "my-entity",
});
console.log(result.signature); // tx sig
console.log(result.event); // decoded EntityCreated event
```

---

## Module API Reference

### Entity (`sdk.ipCore.entity`)

```ts
// Create
await sdk.ipCore.entity.create({
  handle: "my-entity", // string | Uint8Array (max 32 bytes)
  additionalControllers: [pubkeyA], // PublicKey[] (optional, default [])
  signatureThreshold: 1, // number (optional, default 1)
  creator: walletPubkey, // optional, defaults to wallet
});

// Update controllers
await sdk.ipCore.entity.updateControllers({
  entity: entityPda,
  newControllers: [pubkeyA, pubkeyB],
  newThreshold: 2,
  controllerSigners: [existingController], // existing controllers that co-sign
});
```

### IP (`sdk.ipCore.ip`)

```ts
// Create — contentHash must be a 32-byte SHA-256 digest
await sdk.ipCore.ip.create({
  registrantEntity: entityPda,
  contentHash: sha256Hash(new TextEncoder().encode("ipfs://Qm...")),
  treasuryTokenAccount: treasuryAta, // optional, derived from config
  payerTokenAccount: payerAta, // optional, derived as payer ATA
  controllerSigners: [],
});

// Transfer
await sdk.ipCore.ip.transfer({
  ip: ipPda,
  currentOwnerEntity: entityA,
  newOwnerEntity: entityB,
  controllerSigners: [controllerOfEntityA],
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
  controllerSigners: [],
});

// IP metadata
await sdk.ipCore.metadata.createIpMetadata({
  ip: ipPda,
  ownerEntity: entityPda,
  schema: schemaPda,
  dataHash: sha256Hash(metadataBytes),
  cid: "ipfs://QmIpMeta...",
  controllerSigners: [],
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
  controllerSigners: [],
});

// Update derivative license
await sdk.ipCore.derivative.updateLicense({
  parentIp: parentIpPda,
  childIp: childIpPda,
  childOwnerEntity: childEntityPda,
  newLicenseGrant: newGrantPda,
  newLicense: newLicensePda,
  controllerSigners: [],
});
```

### License (`sdk.license.license`)

```ts
await sdk.license.license.create({
  originIp: ipPda,
  ownerEntity: entityPda,
  derivativesAllowed: true,
  controllerSigners: [],
});

await sdk.license.license.update({
  originIp: ipPda,
  authorityEntity: entityPda,
  derivativesAllowed: false,
  controllerSigners: [],
});

await sdk.license.license.revoke({
  originIp: ipPda,
  authorityEntity: entityPda,
  controllerSigners: [],
});
```

### License Grants (`sdk.license.grant`)

```ts
await sdk.license.grant.create({
  originIp: ipPda,
  authorityEntity: entityPda,
  granteeEntity: granteePda,
  expiration: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
  controllerSigners: [],
});

await sdk.license.grant.revoke({
  originIp: ipPda,
  authorityEntity: entityPda,
  granteeEntity: granteePda,
  controllerSigners: [],
});
```

---

## PDA Helpers

Derive on-chain addresses deterministically without making RPC calls:

```ts
import {
  deriveEntityPda,
  deriveIpPda,
  deriveMetadataSchemaPda,
  deriveEntityMetadataPda,
  deriveIpMetadataPda,
  deriveLicensePda,
  deriveLicenseGrantPda,
  deriveDerivativeLinkPda,
} from "@mycelium-ip/core-sdk";
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

## Multi-sig / Controller Signers

Entities can have multiple controllers with a signature threshold.
Pass `controllerSigners: PublicKey[]` on any params interface that requires
entity authority. The SDK converts these into `remainingAccounts` via
`buildSignerMetas()`.

```ts
import { buildSignerMetas } from "@mycelium-ip/core-sdk";
const metas = buildSignerMetas([controller1, controller2]);
// [{ pubkey, isSigner: true, isWritable: false }, ...]
```

---

## Error Handling

All errors extend `MyceliumError` with a `.code` discriminant:

| Error Class                     | Code                         | When                                    |
| ------------------------------- | ---------------------------- | --------------------------------------- |
| `TokenAccountNotFoundError`     | `TOKEN_ACCOUNT_NOT_FOUND`    | ATA doesn't exist on-chain              |
| `InsufficientTokenBalanceError` | `INSUFFICIENT_TOKEN_BALANCE` | Payer balance < registration fee        |
| `EntityNotFoundError`           | `ENTITY_NOT_FOUND`           | Entity PDA doesn't exist                |
| `InsufficientSignersError`      | `INSUFFICIENT_SIGNERS`       | controllerSigners don't meet threshold  |
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
  MyceliumClientOptions,
  MyceliumCluster, // "devnet" | "mainnet-beta"
  TransactionResult, // { signature: string; event: E }
  StringOrBytes,
  CreateEntityParams,
  UpdateEntityControllersParams,
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
  ProtocolConfig,
  EntityAccount,
  SendTxOptions,
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
3. **Multi-sig threshold** — You must pass **all** required controller public
   keys via `controllerSigners` or the on-chain check fails.
4. **Content hash** — `CreateIpParams.contentHash` expects a 32-byte SHA-256
   digest. Use `sha256Hash()` from this package.
5. **`cluster` default** — Defaults to `"devnet"`. Set explicitly for
   mainnet-beta.
6. **Token accounts** — If `treasuryTokenAccount` / `payerTokenAccount` are
   omitted in `CreateIpParams`, the SDK derives them from on-chain config.
   Ensure the accounts exist and have sufficient balance.

---

## Full Workflow Example

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient, sha256Hash } from "@mycelium-ip/core-sdk";

const sdk = new MyceliumClient({ connection, wallet, cluster: "devnet" });

// 1. Create entity
const entityResult = await sdk.ipCore.entity.create({
  handle: "my-studio",
  additionalControllers: [],
  signatureThreshold: 1,
});

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
