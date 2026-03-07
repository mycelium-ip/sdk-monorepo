---
applyTo: "packages/react/**/*"
---

# MyceliumIpProvider Design

The provider initializes the React SDK environment.

It must create the core SDK client and expose it via context.

---

# Provider API

```
<MyceliumIpProvider
  connection={connection}
  wallet={wallet}
  queryClient={queryClient}
  options={{
    confirmation: "confirmed",
    devtools: true
  }}
>
  {children}
</MyceliumIpProvider>
```

---

# Props

## connection (required)

Solana RPC connection.

## wallet (required)

Wallet implementing the MyceliumWallet interface.

## queryClient (optional)

Existing TanStack Query client.

If omitted, the provider creates one.

## options (optional)

Configuration object.

### Options:

- confirmation: Transaction confirmation level. (Default: "confirmed")
- devtools: Enable TanStack Query devtools. (Default: true in development, false in production)

---

# Context Value

Provider must expose:

connection
wallet
client (core-sdk instance)
confirmation

---

# Internal Hooks

The following hooks must be implemented:

useMyceliumClient()

useMyceliumConnection()

useMyceliumWallet()

useMyceliumContext()

These are used internally by all hooks.
