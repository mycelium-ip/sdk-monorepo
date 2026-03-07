---
applyTo: "packages/react/**/*"
---

# Hook Generation Rules

Every SDK method must have a corresponding React hook.

---

# Query Hooks

SDK: client.getIp(id)

Hook: useIp(id)

Implementation:

```
useQuery({
  queryKey: queryKeys.ip(id),
  queryFn: () => client.getIp(id)
})
```

---

# Mutation Hooks

SDK: client.createIp(input)

Hook: useCreateIp()

Implementation must use useMutation.

---

# Invalidation

Mutations must invalidate relevant queries.

Example:

createIp

invalidate

["mycelium", "ips"]

---

# Infinite Queries

List endpoints must support pagination.

Hooks must use: useInfiniteQuery
