# @mycelium/core-sdk — Folder Structure Guide

This document explains the purpose and responsibilities of each folder in the **Core SDK**. It is intended as a **developer guide** and a **guardrail** to prevent architectural drift over time.

The Core SDK is a **protocol SDK**. It must remain:

- Framework-agnostic
- Anchor-runtime–free
- Stable and semver-safe

If a change violates those principles, it does not belong here.

---

## High-level layout

```
packages/core-sdk/
├─ src/
│  ├─ accounts/
│  ├─ constants/
│  ├─ errors/
│  ├─ idl/
│  ├─ instructions/
│  ├─ pda/
│  ├─ transactions/
│  ├─ utils/
│  └─ index.ts
├─ tsconfig.json
├─ tsconfig.build.json
└─ package.json
```

---

## `src/constants/`

**Purpose:**
Protocol-level constants that are shared across the entire ecosystem.

**What belongs here:**

- Program IDs (`PublicKey` constants)
- Seed prefixes (string or byte constants)
- Fixed version identifiers
- Namespace or domain separators

**Examples:**

- `IPCORE_PROGRAM_ID`
- `ENTITY_SEED_PREFIX = "entity"`
- `METADATA_VERSION = 1`

**Rules:**

- Constants must be deterministic and chain-agnostic
- No environment-specific logic
- No imports from other SDK modules

If a constant changes frequently, it probably does _not_ belong here.

---

## `src/idl/`

**Purpose:**
Canonical on-chain interface definitions produced by `anchor build`.

**What belongs here:**

- Raw IDL JSON files copied from `target/idl/`

**How it is used:**

- Instruction layout definitions
- Account layout definitions
- Discriminator derivation
- Argument typing

**Rules:**

- Treat IDL files as **read-only protocol artifacts**
- Do not hand-edit IDLs
- Updates must come from program releases

The IDL is the _contract_ between on-chain programs and the SDK.

---

## `src/pda/`

**Purpose:**
Pure, deterministic PDA derivation helpers.

**What belongs here:**

- Functions that derive PDAs
- Seed composition logic
- Versioned PDA helpers (if applicable)

**Examples:**

- `deriveEntityPda()`
- `deriveIpAccountPda()`
- `deriveMetadataPda()`

**Rules:**

- No RPC calls
- No side effects
- Input → output must be fully deterministic

If a function requires a `Connection`, it does not belong here.

---

## `src/accounts/`

**Purpose:**
Account decoding, encoding, and type definitions.

**What belongs here:**

- Account interfaces / types
- Account decoders (buffer → structured object)
- Discriminator validation

**Examples:**

- `decodeEntityAccount()`
- `EntityAccount` type

**Rules:**

- No transaction sending
- No instruction building
- Decoding must rely only on IDL + layouts

This layer answers the question:

> "What is stored on-chain, and how do we read it?"

---

## `src/instructions/`

**Purpose:**
Instruction builders (single-instruction scope).

**What belongs here:**

- Functions that return `TransactionInstruction`
- Instruction data encoding
- Account metas construction

**Examples:**

- `buildCreateEntityInstruction()`
- `buildUpdateControllersInstruction()`

**Rules:**

- Must not send transactions
- Must not sign transactions
- Must not assume wallets or frameworks

This layer answers:

> "How do I express intent to the program?"

---

## `src/transactions/`

**Purpose:**
High-level transaction composition helpers.

**What belongs here:**

- Functions that assemble one or more instructions
- Optional helpers that return `Transaction`

**Examples:**

- `createEntityTransaction()`
- `registerIpTransaction()`

**Rules:**

- Still no signing or sending
- Wallet interaction belongs in higher layers (apps / react)

Think of this as _convenience glue_, not protocol logic.

---

## `src/errors/`

**Purpose:**
Human-friendly, typed error definitions.

**What belongs here:**

- SDK error classes
- Program error mappings
- Error code → message translation

**Examples:**

- `EntityAlreadyExistsError`
- `UnauthorizedControllerError`

**Rules:**

- Do not leak raw Anchor error objects
- Errors should be stable across versions

SDK consumers should never need to read program source code to understand failures.

---

## `src/utils/`

**Purpose:**
Low-level shared utilities used across the SDK.

**What belongs here:**

- Byte helpers
- Hashing helpers
- Serialization helpers
- Small, reusable pure functions

**Rules:**

- No Solana RPC calls
- No protocol-specific semantics
- If it understands IP or Entity concepts, it probably belongs elsewhere

---

## `src/index.ts`

**Purpose:**
The **only public entry point** of the SDK.

**What belongs here:**

- Explicit exports of the public API
- No re-exporting of internal folders wholesale

**Rules:**

- If it is not exported here, it is not public
- Changing exports is a breaking change

This file defines the SDK’s **contract with the world**.

---

## Architectural boundaries (non-negotiable)

- ❌ No Anchor runtime dependency
- ❌ No React, DOM, or browser assumptions
- ❌ No wallet adapters
- ✅ `@solana/web3.js` only
- ✅ Deterministic, side-effect-free core logic

---

## Mental model

Think of the Core SDK as:

> **A typed, deterministic description of the protocol — not an app helper.**

Apps, CLIs, indexers, and React hooks all sit _on top_ of this layer.

If developers are unsure where code belongs, default to **not adding it** until the boundary is clear.
