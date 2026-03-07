# Mycelium Core SDK – High Level Specification

This document defines the purpose and high-level design of the **Mycelium Core SDK**.

Copilot agents must follow this document when generating or modifying SDK code.

---

# Purpose

The Mycelium Core SDK provides a **developer-friendly interface** for interacting with the Mycelium Protocol Solana programs.

The SDK abstracts away:

- PDA derivations
- account resolution
- Anchor program loading
- transaction building
- transaction signing

The SDK must allow developers to integrate the protocol into **Node.js and Next.js applications** without needing to understand low-level Anchor details.

---

# Target Users

The SDK is designed for:

- Node.js backend developers
- Next.js full-stack developers
- Solana developers integrating IP registry functionality

Developers using the SDK should **not need to understand PDA derivations or Anchor account constraints**.

---

# Programs Supported

The SDK interacts with two on-chain programs:

### IP Core Program

Responsible for:

- protocol configuration
- entity registration
- IP registration
- metadata schemas
- metadata records
- derivative links

### License Program

Responsible for:

- license definitions
- license grants

The SDK must support both programs through a **single unified client**.

---

# SDK Design Principles

The SDK must follow these principles.

## 1. PDA Abstraction

The SDK must internally derive all PDAs.

Users should **never manually compute PDAs**.

---

## 2. Account Resolution

Users should pass only **logical inputs** such as:

- entity
- ip
- owner
- metadata
- license terms

The SDK resolves all required program accounts automatically.

---

## 3. Wallet Compatibility

The SDK must support wallets implementing the Solana **Wallet Adapter interface**.

Example compatible wallets:

- browser wallets
- embedded wallets
- Privy wallets
- backend signers

The SDK must **not assume access to private keys**.

---

## 4. Transaction Control

Each instruction must expose two APIs:

### Instruction Builder

Returns a transaction instruction.

Example:

sdk.ipCore.ip.createIx(...)

---

### Transaction Sender

Builds and sends a transaction.

Example:

sdk.ipCore.ip.create(...)

---

## 5. Browser + Node Support

The SDK must work in:

- Node.js
- Next.js
- browser environments

Avoid Node-only APIs.

---

# Public SDK Entry Point

The SDK exposes a single entry point:

MyceliumClient

Example usage:

```ts
const sdk = new MyceliumClient({
  connection,
  wallet
})

const entity = await sdk.ipCore.entity.create({
  name: "Marvel"
})

const ip = await sdk.ipCore.ip.create({
  entity: entity.publicKey,
  owner: wallet.publicKey
})

await sdk.license.create({
  ip: ip.publicKey,
  terms: ...
})
```

---

# SDK Responsibilities

The SDK must:

- load Anchor IDLs
- create Anchor providers
- initialize Anchor programs
- derive PDAs
- build instructions
- construct transactions
- request wallet signatures
- submit transactions

---

# SDK Non-Responsibilities

The SDK must NOT:

- implement protocol business logic
- implement off-chain indexing
- enforce protocol governance rules
- store user data

All protocol rules are enforced **on-chain**.

---

# IDL Management

The SDK must load IDLs from the repository.

IDL files must be stored in:

```
sdk/idl/
```

Example:

```
sdk/idl/ip_core.json
sdk/idl/license.json
```

These files must match the deployed programs.

---

# Long-Term Design Goal

The SDK should remain stable even if additional programs are added later.

Future programs should integrate without breaking the existing client API.

---

End of high-level SDK specification.
