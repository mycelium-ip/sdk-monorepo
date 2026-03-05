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
  IP_CORE_PROGRAM_ID,
  LICENSE_PROGRAM_ID,
  createProvider,
  sendInstruction,
  deriveEntityPda,
} from "@mycelium-ip/core-sdk";
```

Main exports include:

- `MyceliumClient`
- program constants (`IP_CORE_PROGRAM_ID`, `LICENSE_PROGRAM_ID`, `PDA_SEEDS`)
- PDA helpers (`deriveEntityPda`, `deriveIpPda`, `deriveMetadataSchemaPda`, etc.)
- utility helpers (`createProvider`, `sendInstruction`, conversion helpers)
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

---

## Requirements

You need:

1. A `Connection` to a Solana cluster
2. A wallet object compatible with the SDK wallet interface:
   - `publicKey`
   - `signTransaction(tx)`
   - `signAllTransactions(txs)`
   - optional `signMessage(message)`

### Wallet interface shape

```ts
import type {
  Transaction,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";

export interface WalletAdapterLike {
  publicKey: PublicKey | null;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ): Promise<T[]>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}
```

> `wallet.publicKey` must be present when creating `MyceliumClient`.

---

## Initialize the SDK

### Browser / Next.js (wallet-adapter style)

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient } from "@mycelium-ip/core-sdk";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Example: wallet from @solana/wallet-adapter-react or similar
const sdk = new MyceliumClient({
  connection,
  wallet,
  // Optional: forwarded to AnchorProvider confirm options
  confirmOptions: { commitment: "confirmed" },
});
```

### Node.js (custom signer-backed wallet)

```ts
import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { MyceliumClient, type WalletAdapterLike } from "@mycelium-ip/core-sdk";

const payer = Keypair.generate();
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const wallet: WalletAdapterLike = {
  publicKey: payer.publicKey,
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T) {
    if (tx instanceof VersionedTransaction) {
      tx.sign([payer]);
      return tx;
    }

    tx.partialSign(payer);
    return tx;
  },
  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[],
  ) {
    return Promise.all(txs.map((tx) => wallet.signTransaction(tx)));
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

const createIpIx = await sdk.ipCore.ip.createIx({
  registrantEntity: new PublicKey("..."),
  contentHash: "content-hash-v1",
  treasuryTokenAccount: new PublicKey("..."),
  payerTokenAccount: new PublicKey("..."),
  // payer optional (defaults to wallet.publicKey)
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
  contentHash: "content-hash-v1",
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

### Conversion helpers

Useful for byte-length constrained protocol fields and integer conversions:

- `toFixedBytes(...)`
- `utf8Bytes(...)`
- `toU64Bn(...)`
- `toI64Bn(...)`
- `u64SeedBytes(...)`

---

## Common pitfalls

- `wallet.publicKey` is required at initialization; missing key throws.
- Sender methods require wallet signing capability (`signTransaction`/`signAllTransactions`).
- Program IDs default from bundled IDLs, with fallback constants if IDL address is absent.
- `MyceliumClientOptions.commitment` exists in types but is currently not consumed directly by `MyceliumClient`; use `confirmOptions` for provider/send behavior.

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
