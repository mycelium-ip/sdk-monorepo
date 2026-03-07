# Mycelium Protocol SDK – Detailed Architecture Specification

This document defines the full architecture of the Mycelium SDK.

Copilot agents must follow this structure when generating SDK code.

---

# Dependencies

The SDK must use the following dependencies.

Required:

- @coral-xyz/anchor
- @solana/web3.js

Optional utilities:

- bs58
- buffer
- bn.js

The SDK must not introduce unnecessary dependencies.

---

# SDK Folder Structure

The SDK must follow this structure.

```
sdk/
│
├─ src/
│
│  ├─ index.ts
│
│  ├─ client/
│  │   └─ MyceliumClient.ts
│
│  ├─ programs/
│  │
│  │   ├─ ipCore/
│  │   │   ├─ IpCoreClient.ts
│  │   │   ├─ entity.ts
│  │   │   ├─ ip.ts
│  │   │   ├─ metadata.ts
│  │   │   └─ derivative.ts
│  │
│  │   └─ license/
│  │       ├─ LicenseClient.ts
│  │       ├─ license.ts
│  │       └─ grant.ts
│
│  ├─ pda/
│  │   ├─ entity.ts
│  │   ├─ ip.ts
│  │   ├─ metadata.ts
│  │   ├─ license.ts
│  │   └─ derivative.ts
│
│  ├─ constants/
│  │   └─ programs.ts
│
│  ├─ utils/
│  │   ├─ provider.ts
│  │   └─ transactions.ts
│
│  └─ types/
│      └─ index.ts
│
├─ idl/
│  ├─ ip_core.json
│  └─ license.json
│
├─ package.json
└─ tsconfig.json
```

---

# SDK Entry Point

File:

```
src/index.ts
```

Exports:

```
MyceliumClient
types
utility helpers
```

---

# MyceliumClient

File:

```
src/client/MyceliumClient.ts
```

Constructor specification:

```ts
type MyceliumClientOptions = {
  connection: Connection;
  wallet: WalletAdapter;
};
```

WalletAdapter must support:

```
signTransaction
signAllTransactions
signMessage
publicKey
```

The constructor must:

1. create an AnchorProvider
2. load program IDLs
3. initialize program clients

Example:

```ts
class MyceliumClient {
  ipCore: IpCoreClient;
  license: LicenseClient;

  constructor(options: MyceliumClientOptions) {
    const provider = new AnchorProvider(
      options.connection,
      options.wallet,
      AnchorProvider.defaultOptions(),
    );

    this.ipCore = new IpCoreClient(provider);
    this.license = new LicenseClient(provider);
  }
}
```

---

# Program Clients

Each on-chain program must have a dedicated client.

Example:

```
IpCoreClient
LicenseClient
```

Responsibilities:

- initialize Anchor Program
- expose instruction modules

Example structure:

```ts
class IpCoreClient {
  program: Program<IpCoreIdl>;

  entity: EntityModule;
  ip: IpModule;
  metadata: MetadataModule;
  derivative: DerivativeModule;
}
```

---

# Instruction Modules

Each instruction group must be implemented as a module.

Example:

```
entity.ts
ip.ts
metadata.ts
license.ts
```

Each module must expose:

```
createIx(...)
create(...)
```

---

# Instruction Builder

The instruction builder returns a TransactionInstruction.

Example:

```ts
async createIx(params): Promise<TransactionInstruction>
```

Implementation:

- derive PDAs
- resolve accounts
- build Anchor instruction

---

# Transaction Sender

The sender builds and sends a transaction.

Example:

```ts
async create(params): Promise<TransactionSignature>
```

Implementation:

1. call createIx
2. construct transaction
3. send via provider

---

# PDA Derivation Layer

All PDA logic must exist in:

```
src/pda/
```

Example:

```
deriveEntityPda
deriveIpPda
deriveLicensePda
```

Instruction modules must call PDA utilities instead of deriving addresses directly.

---

# Constants

Program IDs must be defined in:

```
src/constants/programs.ts
```

Example:

```ts
export const IP_CORE_PROGRAM_ID = new PublicKey(...)
export const LICENSE_PROGRAM_ID = new PublicKey(...)
```

---

# IDL Loading

IDL files must be loaded from:

```
sdk/idl/
```

Example:

```
ip_core.json
license.json
```

Program clients must import these files.

---

# Transaction Utilities

Transaction helpers must exist in:

```
src/utils/transactions.ts
```

Responsibilities:

- transaction creation
- transaction sending
- batching support

---

# Type Definitions

Common types must exist in:

```
src/types/
```

Example:

```
CreateEntityParams
CreateIpParams
CreateLicenseParams
```

These types define the SDK public API.

---

# Method Design Guidelines

All SDK methods must:

- accept logical parameters
- resolve accounts internally
- derive PDAs automatically

Example user call:

```ts
await sdk.ipCore.ip.create({
  entity,
  owner,
  metadata,
});
```

Users must not pass:

- PDAs
- bump seeds
- internal program accounts

---

# SDK Output Types

Functions should return:

- transaction signatures
- created public keys
- parsed account data when possible

---

# Error Handling

SDK methods must propagate program errors without modification.

Do not hide Anchor errors.

---

# Future Extensibility

The architecture must allow additional programs to be added easily.

New programs should follow the same pattern:

```
programs/<programName>/
```

---

End of SDK architecture specification.
