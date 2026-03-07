---
applyTo: "packages/react/**/*"
---

# Query Key System

All query keys must be namespaced.

Prefix:

["mycelium", ...]

---

# Examples

IP query: ["mycelium", "ip", ipId]

Entity query: ["mycelium", "entity", entityId]

List query: ["mycelium", "ips"]

---

# Query Key File

All keys must be defined in:

src/queryKeys/queryKeys.ts

Example:

```
export const queryKeys = {
  ip: (id: string) => ["mycelium", "ip", id],
  entity: (id: string) => ["mycelium", "entity", id],
  ips: () => ["mycelium", "ips"],
}
```
