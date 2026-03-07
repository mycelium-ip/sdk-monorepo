---
applyTo: "packages/react/**/*"
---

# Transaction Lifecycle

Mutation hooks are responsible for the entire transaction lifecycle.

---

# Required Steps

1. Build transaction using SDK
2. Sign transaction using wallet
3. Send transaction using connection
4. Confirm transaction
5. Invalidate queries

---

# Standard Pattern

```
const tx = await client.createIp(input)

const signed = await wallet.signTransaction(tx)

const signature =
  await connection.sendRawTransaction(
    signed.serialize()
  )

await connection.confirmTransaction(
  signature,
  confirmation
)
```

---

# Confirmation Level

Read from provider context.

confirmation defaults to: "confirmed"
