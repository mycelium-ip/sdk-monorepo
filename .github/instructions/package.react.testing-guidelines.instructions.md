---
applyTo: "packages/react/**/*"
---

# Testing Guidelines

All hooks must be tested.

Testing stack:

Vitest
React Testing Library

---

# What to Test

Queries

- correct query keys
- correct SDK calls

Mutations

- transaction flow
- wallet signing
- connection sending
- query invalidation

---

# Mocking

Tests must mock:

Connection
Wallet
Core SDK client

Do NOT perform real RPC calls.
