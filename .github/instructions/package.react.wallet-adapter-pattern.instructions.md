---
applyTo: "packages/react/**/*"
---

# Wallet Adapter Pattern

The React SDK must remain wallet-agnostic.

Do NOT import or depend on any wallet library.

---

# Wallet Interface

```
export interface MyceliumWallet {

  publicKey: PublicKey | null

  signTransaction(
    tx: Transaction
  ): Promise<Transaction>

  signAllTransactions?(
    txs: Transaction[]
  ): Promise<Transaction[]>

  signMessage?(
    message: Uint8Array
  ): Promise<Uint8Array>
}
```

---

# Adapter Example (Wallet Adapter)

```
const wallet: MyceliumWallet = {
  publicKey,
  signTransaction,
  signAllTransactions
}
```

---

# Adapter Example (Privy)

```
const wallet: MyceliumWallet = {
  publicKey: new PublicKey(privyWallet.address),
  signTransaction: privyWallet.signTransaction,
  signMessage: privyWallet.signMessage
}
```

---

Hooks must ONLY interact with this interface.
