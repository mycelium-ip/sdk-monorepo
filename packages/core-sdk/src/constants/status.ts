// src/constants/status.ts

// Entity statuses
export const ENTITY_STATUS_ACTIVE = 1;
export const ENTITY_STATUS_FROZEN = 2;

// IP asset statuses
export const IP_STATUS_ACTIVE = 1;
export const IP_STATUS_FROZEN = 2;

// IP state
export const IP_STATE_DERIVATIVE_UNANCHORED = 1;

// Derivative link statuses
export const LINK_STATUS_ASSERTED = 1;
export const LINK_STATUS_RESOLVED = 2;
export const LINK_STATUS_DISPUTED = 3;

export enum EntityStatus {
  ACTIVE = 1,
  FROZEN = 2,
}

export enum IpStatus {
  ACTIVE = 1,
  FROZEN = 2,
}

export enum IpState {
  DERIVATIVE_UNANCHORED = 1,
}

export enum LinkStatus {
  ASSERTED = 1,
  RESOLVED = 2,
  DISPUTED = 3,
}
