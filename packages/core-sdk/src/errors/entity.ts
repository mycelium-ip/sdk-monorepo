import { SDKError } from "./base";

// ---------------------
// Entity errors
// ---------------------
export class UnauthorizedControllerError extends SDKError {
  constructor() {
    super("Signer is not a controller of this entity");
  }
}

export class InvalidControllerThresholdError extends SDKError {
  constructor() {
    super("Invalid controller threshold");
  }
}

export class EmptyControllerSetError extends SDKError {
  constructor() {
    super("Controller list cannot be empty");
  }
}

export class DuplicateControllersError extends SDKError {
  constructor() {
    super("Duplicate controllers are not allowed");
  }
}

export class EntityFrozenError extends SDKError {
  constructor() {
    super("Entity is frozen");
  }
}

export class NotEnoughControllerSignersError extends SDKError {
  constructor() {
    super("Not enough controller signers");
  }
}

// ---------------------
// Custom errors
// ---------------------
export class OverflowError extends SDKError {
  constructor() {
    super("Arithmetic overflow");
  }
}
