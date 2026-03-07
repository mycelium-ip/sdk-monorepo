---
applyTo: "packages/react/**/*"
---

# @mycelium-ip/react Architecture

This package provides an opinionated React integration for the Mycelium IP protocol.

It wraps the core SDK (`@mycelium-ip/core-sdk`) and exposes React hooks built on top of TanStack Query.

Goals:

- React-first developer experience
- Wallet-agnostic architecture
- Consistent transaction lifecycle
- Works with Next.js client components
- Minimal abstraction over the core SDK

This package is intentionally **thin**. It does NOT implement UI or business logic.

---

# Core Principles

1. Hooks wrap SDK calls, not reimplement logic
2. Wallets are abstracted via a minimal interface
3. Transactions are handled in hooks
4. Queries use TanStack Query
5. Mutations automatically invalidate relevant queries
6. Provider initializes the SDK client
7. Hooks must work in Next.js client components

---

# Dependency Architecture

@mycelium-ip/react
├ depends on @mycelium-ip/core-sdk
├ depends on @tanstack/react-query
└ does NOT depend on any wallet library

Wallet integrations must be provided by the application.

---

# Provider

Applications must wrap their app with:

<MyceliumIpProvider>

The provider:

- receives Solana connection
- receives wallet adapter
- creates the core SDK client
- provides TanStack Query context
- manages confirmation level
- optionally enables React Query devtools

---

# Hook Types

Hooks fall into three categories:

Queries

useIp(id)
useEntity(id)

Mutations

useCreateIp()
useUpdateIp()

Infinite Queries

useInfiniteIps()

---

# Hook Return Convention

All query hooks must return the full React Query object.

Example:

const query = useIp(ipId)

query.data
query.isLoading
query.error
query.refetch

Do NOT return only the data.
