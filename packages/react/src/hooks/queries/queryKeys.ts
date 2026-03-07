/**
 * Query key factory for TanStack Query.
 *
 * Provides a structured, type-safe way to define query keys
 * for granular cache invalidation.
 *
 * @example
 * ```ts
 * // Invalidate all mycelium queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.all });
 *
 * // Invalidate specific entity
 * queryClient.invalidateQueries({ queryKey: queryKeys.entity("123") });
 *
 * // Invalidate all IPs
 * queryClient.invalidateQueries({ queryKey: queryKeys.ips() });
 * ```
 */
export const queryKeys = {
  /** Root key for all mycelium queries */
  all: ["mycelium"] as const,

  /** Key for all entity queries */
  entities: () => [...queryKeys.all, "entities"] as const,

  /** Key for a specific entity */
  entity: (id: string) => [...queryKeys.entities(), id] as const,

  /** Key for all IP queries */
  ips: () => [...queryKeys.all, "ips"] as const,

  /** Key for a specific IP */
  ip: (id: string) => [...queryKeys.ips(), id] as const,

  /** Key for all license queries */
  licenses: () => [...queryKeys.all, "licenses"] as const,

  /** Key for a specific license */
  license: (id: string) => [...queryKeys.licenses(), id] as const,

  /** Key for all grant queries */
  grants: () => [...queryKeys.all, "grants"] as const,

  /** Key for a specific grant */
  grant: (id: string) => [...queryKeys.grants(), id] as const,

  /** Key for all metadata queries */
  metadata: () => [...queryKeys.all, "metadata"] as const,

  /** Key for all derivative queries */
  derivatives: () => [...queryKeys.all, "derivatives"] as const,

  /** Key for a specific derivative */
  derivative: (id: string) => [...queryKeys.derivatives(), id] as const,
};
