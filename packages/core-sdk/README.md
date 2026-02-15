# Mycelium Core SDK (Stateless Transaction Factory)

This is the core, stateless SDK for building deterministic Solana transactions for the Mycelium protocol. It generates instructions and transactions offline. It does not create RPC connections, providers, wallets, or send anything.

- Stateless and offline-capable
- Chain-aware program ID resolution
- Thin SDK wrapper around existing transaction builders

## Installation

```bash
pnpm add @mycelium/core-sdk
```

## Quickstart

Initialize the SDK for a chain, then use namespaces to generate unsigned transactions.

```ts
import { MyceliumSDK } from "@mycelium/core-sdk";

// 1) Initialize the SDK (no network, no wallet required)
const sdk = new MyceliumSDK({ chain: "devnet" });

// 2) Prepare your Anchor Programs elsewhere (not handled by core-sdk)
// These are placeholders — you should construct them in your app.
const entityProgram = /* Program<Entity> */ undefined as any;
const metadataProgram = /* Program<Metadata> */ undefined as any;
const ipcoreProgram = /* Program<Ipcore> */ undefined as any;

// Common inputs (replace with your keys)
const payer = /* PublicKey */ undefined as any;
const controllers = [/* PublicKey[] */];
```

### Register an Entity

Creates an unsigned transaction with a registerEntity instruction and a createEntityMetadata instruction (metadata v1) when applicable.

```ts
const { transaction } = await sdk.entity.generateRegisterTransaction({
  program: entityProgram,
  metadataProgram,
  controllers,
  threshold: 1,
  metadataUri: "ipfs://...", // your URI
  payer,
});
// transaction has NO fee payer, NO blockhash, and is UNSIGNED
```

### Register a Root IP Asset

Creates an unsigned transaction with a registerRootIp instruction and createIpMetadata v1.

```ts
const { transaction: ipTx, ipAssetPda } =
  await sdk.ipcore.generateRegisterIpAssetTransaction({
    program: ipcoreProgram,
    metadataProgram,
    payer,
    entityIndex: 0,            // your entity index
    registrationFee: 0.1,      // in SOL (converted inside)
    metadataUri: "ipfs://...", // your URI
    controllers,
  });
```

### Create Entity Metadata (v1)

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const entityPda = /* PublicKey */ undefined as any;
const schemaPda = /* PublicKey */ undefined as any;

const { transaction: createEntityMetaTx } =
  await sdk.metadata.generateCreateEntityMetadataTransaction({
    program: metadataProgram,
    entityPda: entityPda as PublicKey,
    schemaPda: schemaPda as PublicKey,
    version: new BN(1),
    metadataUri: "ipfs://...",
    payer,
    controllers,
  });
```

### Create IP Metadata (v1)

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const ipAssetPda = /* PublicKey */ undefined as any;
const entityPda = /* PublicKey */ undefined as any;
const schemaPda = /* PublicKey */ undefined as any;

const { transaction: createIpMetaTx } =
  await sdk.metadata.generateCreateIpMetadataTransaction({
    program: metadataProgram,
    ipAssetPda: ipAssetPda as PublicKey,
    entityPda: entityPda as PublicKey,
    schemaPda: schemaPda as PublicKey,
    version: new BN(1),
    metadataUri: "ipfs://...",
    payer,
    controllers,
  });
```

### Update Entity Metadata

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const entityPda = /* PublicKey */ undefined as any;
const previousMetadataPda = /* PublicKey */ undefined as any;
const newMetadataPda = /* PublicKey */ undefined as any;
const schemaPda = /* PublicKey */ undefined as any;
const authority = /* PublicKey */ undefined as any;

const { transaction: updateEntityMetaTx } =
  await sdk.metadata.generateUpdateEntityMetadataTransaction({
    program: metadataProgram,
    entityPda: entityPda as PublicKey,
    previousMetadataPda: previousMetadataPda as PublicKey,
    newMetadataPda: newMetadataPda as PublicKey,
    schemaPda: schemaPda as PublicKey,
    authority: authority as PublicKey,
    payer,
    version: new BN(2),
    metadataUri: "ipfs://...",
    controllers,
  });
```

### Update IP Metadata

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const ipAssetPda = /* PublicKey */ undefined as any;
const entityPda = /* PublicKey */ undefined as any;
const previousMetadataPda = /* PublicKey */ undefined as any;
const newMetadataPda = /* PublicKey */ undefined as any;
const schemaPda = /* PublicKey */ undefined as any;
const authority = /* PublicKey */ undefined as any;

const { transaction: updateIpMetaTx } =
  await sdk.metadata.generateUpdateIpMetadataTransaction({
    program: metadataProgram,
    ipAssetPda: ipAssetPda as PublicKey,
    entityPda: entityPda as PublicKey,
    previousMetadataPda: previousMetadataPda as PublicKey,
    newMetadataPda: newMetadataPda as PublicKey,
    schemaPda: schemaPda as PublicKey,
    authority: authority as PublicKey,
    payer,
    version: new BN(2),
    metadataUri: "ipfs://...",
    controllers,
  });
```

## Important Notes

- Returns unsigned transactions without fee payer or blockhash. Set those in your app before signing and sending.
- Core SDK does not create Connection, AnchorProvider, or Program. You must supply Program instances if your chosen transaction builder expects them.
- No on-chain data is fetched by the SDK itself. Some existing transaction builders may check account state via program.account.*; construct those programs and providers externally if you use those helpers.

## Next Steps

- Sign and send transactions using your own client or higher-level packages (e.g., client-sdk, react-sdk).
- See the full list of builders in sdk/namespaces and transactions/.