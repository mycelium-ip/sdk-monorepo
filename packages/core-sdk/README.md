# @mycelium-ip/core-sdk

TypeScript SDK for interacting with Mycelium IP protocol programs on Solana.

The SDK wraps:

- Anchor provider/program setup
- PDA derivation
- account resolution for common flows
- instruction creation and transaction submission helpers

## What this package exposes

```ts
import {
  MyceliumClient,
  PROGRAM_IDS,
  getProgramIds,
  createProvider,
  sendInstruction,
  deriveEntityPda,
} from "@mycelium-ip/core-sdk";
```

Main exports include:

- `MyceliumClient`
- `StandardWalletWrapper`, `isStandardWallet`, `walletSupportsFeature`, `UnsupportedFeatureError`
- program constants (`PROGRAM_IDS`, `getProgramIds`, `PDA_SEEDS`)
- `MyceliumCluster` type (`'devnet' | 'mainnet-beta'`)
- PDA helpers (`deriveEntityPda`, `deriveIpPda`, `deriveMetadataSchemaPda`, etc.)
- utility helpers (`createProvider`, `sendInstruction`, conversion helpers)
- account helpers (`buildSignerMetas`)
- all SDK types (params/interfaces)

---

## Installation

```bash
pnpm add @mycelium-ip/core-sdk
```

Or:

```bash
npm install @mycelium-ip/core-sdk
# or
yarn add @mycelium-ip/core-sdk
```

The SDK depends on:

- `@coral-xyz/anchor`
- `@solana/web3.js`
- `@wallet-standard/base`
- `@solana/wallet-standard-features`
- `@solana/wallet-standard-chains`

---

## Requirements

You need:

1. A `Connection` to a Solana cluster
2. A [Wallet Standard](https://github.com/wallet-standard/wallet-standard)–compliant `Wallet` object

The SDK uses the **Wallet Standard** (`@wallet-standard/base`) as its native wallet interface. Any wallet that implements the standard `Wallet` interface can be passed directly — no adapter layer required.

### Required wallet features

- `solana:signTransaction` — **required**; the SDK throws `UnsupportedFeatureError` at construction time if absent
- `solana:signAndSendTransaction` — optional; preferred for transaction submission when available
- `solana:signMessage` — optional

### Wallet Standard interface (from `@wallet-standard/base`)

```ts
import type { Wallet } from "@wallet-standard/base";

// The Wallet interface includes:
interface Wallet {
  readonly version: "1.0.0";
  readonly name: string;
  readonly icon: WalletIcon;
  readonly chains: readonly IdentifierString[];
  readonly features: Readonly<Record<string, unknown>>;
  readonly accounts: readonly WalletAccount[];
}
```

> The wallet must have at least one account. `MyceliumClient` derives the signer `PublicKey` from `wallet.accounts[0].publicKey`.

### StandardWalletWrapper

Internally, `MyceliumClient` wraps the `Wallet` in a `StandardWalletWrapper` that provides an SDK-friendly API and satisfies Anchor's provider shape:

```ts
import { StandardWalletWrapper } from "@mycelium-ip/core-sdk";

// Access the wrapper from the client
const sdk = new MyceliumClient({ connection, wallet });
sdk.wallet; // StandardWalletWrapper
sdk.wallet.publicKey; // PublicKey
sdk.wallet.signTransaction(tx); // signs via solana:signTransaction
sdk.wallet.supportsFeature("solana:signAndSendTransaction"); // boolean
```

### Type guard

```ts
import { isStandardWallet } from "@mycelium-ip/core-sdk";

if (isStandardWallet(unknownValue)) {
  // unknownValue is typed as Wallet
  const sdk = new MyceliumClient({ connection, wallet: unknownValue });
}
```

---

## Initialize the SDK

### Browser / Next.js

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient } from "@mycelium-ip/core-sdk";
import type { Wallet } from "@wallet-standard/base";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// `wallet` is any Wallet Standard–compliant wallet
// (e.g. from @solana/wallet-standard-wallet-adapter, Privy, or a browser extension)
const sdk = new MyceliumClient({
  connection,
  wallet,
  // Optional: forwarded to AnchorProvider confirm options
  confirmOptions: { commitment: "confirmed" },
});
```

### Node.js (Keypair-backed wallet)

For server-side or testing use, construct a minimal `Wallet` that satisfies the standard:

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
      signTransaction: async (...inputs) => {
        return inputs.map(({ transaction }) => {
          const tx = Transaction.from(transaction);
          tx.partialSign(payer);
          return { signedTransaction: new Uint8Array(tx.serialize()) };
        });
      },
    },
  },
};

const sdk = new MyceliumClient({ connection, wallet });
```

---

## Usage patterns

Each module supports two styles:

1. **Instruction builder** (`*Ix`) returns `TransactionInstruction`
2. **Transaction sender** (without `Ix`) builds + sends and returns signature (`string`)

### Pattern A: Build instruction only (`createIx`)

```ts
import { PublicKey } from "@solana/web3.js";

const createEntityIx = await sdk.ipCore.entity.createIx({
  handle: "marvel",
  additionalControllers: [],
  signatureThreshold: 1,
  // creator optional (defaults to wallet.publicKey)
});

// The SDK hashes the content internally using SHA-256
const createIpIx = await sdk.ipCore.ip.createIx({
  registrantEntity: new PublicKey("..."),
  content: new TextEncoder().encode("my-ip-content"),
  treasuryTokenAccount: new PublicKey("..."),
  payerTokenAccount: new PublicKey("..."),
  // payer optional (defaults to wallet.publicKey)
  // controllerSigners optional — see "Multi-sig / Controller signers" below
});

// You can compose instructions into your own transaction pipeline.
```

### Pattern B: Send transaction directly (`create`, `update`, `revoke`, ...)

```ts
const entityTx = await sdk.ipCore.entity.create({
  handle: "marvel",
});

const ipTx = await sdk.ipCore.ip.create({
  registrantEntity,
  content: new TextEncoder().encode("my-ip-content"),
  treasuryTokenAccount,
  payerTokenAccount,
});

const transferTx = await sdk.ipCore.ip.transfer({
  ip,
  currentOwnerEntity,
  newOwnerEntity,
});

console.log({ entityTx, ipTx, transferTx });
```

---

## Module map

### IP Core program

- `sdk.ipCore.entity`
  - `createIx`, `create`
  - `updateControllersIx`, `updateControllers`
- `sdk.ipCore.ip`
  - `createIx`, `create`
  - `transferIx`, `transfer`
- `sdk.ipCore.metadata`
  - `createSchemaIx`, `createSchema`
  - `createEntityMetadataIx`, `createEntityMetadata`
  - `createIpMetadataIx`, `createIpMetadata`
- `sdk.ipCore.derivative`
  - `createIx`, `create`
  - `updateLicenseIx`, `updateLicense`

### License program (grant flow)

License client has nested modules. For grant operations use:

- `sdk.license.grant`
  - `createIx`, `create`
  - `revokeIx`, `revoke`

Example:

```ts
const grantSig = await sdk.license.grant.create({
  originIp,
  authorityEntity,
  granteeEntity,
  expiration: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30),
});

const revokeSig = await sdk.license.grant.revoke({
  originIp,
  authorityEntity,
  granteeEntity,
});
```

---

## Multi-sig / Controller signers

Entities in the Mycelium protocol can have multiple controllers and a signature threshold (multi-sig). When an entity requires more than the default signer, pass the `controllerSigners` option to include the additional controller public keys as remaining accounts on the transaction.

The `controllerSigners` field is an optional `PublicKey[]` available on almost every params interface:

- `UpdateEntityControllersParams`
- `CreateIpParams`
- `TransferIpParams`
- `CreateEntityMetadataParams`
- `CreateIpMetadataParams`
- `CreateDerivativeLinkParams`
- `UpdateDerivativeLicenseParams`
- `CreateLicenseParams`, `UpdateLicenseParams`, `RevokeLicenseParams`
- `CreateLicenseGrantParams`, `RevokeLicenseGrantParams`

```ts
const transferIx = await sdk.ipCore.ip.transferIx({
  ip,
  currentOwnerEntity,
  newOwnerEntity,
  controllerSigners: [controller1, controller2],
});
```

### `buildSignerMetas`

If you are building instructions manually (e.g. composing a custom transaction), use the exported `buildSignerMetas` helper to convert an array of controller public keys into the `AccountMeta[]` format expected by Anchor's `remainingAccounts`:

```ts
import { buildSignerMetas } from "@mycelium-ip/core-sdk";

const metas = buildSignerMetas([controller1, controller2]);
// [{ pubkey: controller1, isSigner: true, isWritable: false }, ...]
```

---

## PDA helpers

The SDK exports PDA helpers so you can derive addresses yourself when needed.

```ts
import {
  deriveEntityPda,
  deriveIpPda,
  deriveMetadataSchemaPda,
  deriveLicensePda,
  deriveLicenseGrantPda,
} from "@mycelium-ip/core-sdk";
```

Use these if you need deterministic PDA derivation outside module calls.

---

## Utilities

### Provider helper

```ts
import { createProvider } from "@mycelium-ip/core-sdk";

const provider = createProvider(connection, wallet, {
  commitment: "confirmed",
});
```

### Transaction helper

```ts
import { sendInstruction } from "@mycelium-ip/core-sdk";

const sig = await sendInstruction(provider, instruction);
```

### Account helpers

- `buildSignerMetas(signers?)` — converts `PublicKey[]` to readonly-signer `AccountMeta[]` for multi-sig remaining accounts

### Conversion helpers

Useful for byte-length constrained protocol fields and integer conversions:

- `toFixedBytes(...)`
- `utf8Bytes(...)`
- `toU64Bn(...)`
- `toI64Bn(...)`
- `u64SeedBytes(...)`

---

## Common pitfalls

- The wallet must have at least one account (`wallet.accounts[0]`); an empty accounts array throws at construction.
- The `solana:signTransaction` feature is **required**; missing it throws `UnsupportedFeatureError`.
- Program IDs default from bundled IDLs, with fallback constants if IDL address is absent.
- `MyceliumClientOptions.commitment` exists in types but is currently not consumed directly by `MyceliumClient`; use `confirmOptions` for provider/send behavior.
- When an entity has multiple controllers, you must pass **all** required controller public keys via `controllerSigners` or the on-chain authority check will fail.

---

## Testing in this repo

From the monorepo root:

```bash
pnpm --filter @mycelium-ip/core-sdk test
pnpm --filter @mycelium-ip/core-sdk typecheck
pnpm --filter @mycelium-ip/core-sdk lint
```

---

## Support

If you’re integrating this SDK in Node.js or Next.js and want a tailored example flow for your stack, open an issue in this repository with your environment details and target cluster.
