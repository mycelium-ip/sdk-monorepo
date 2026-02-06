import { SDKError } from "./base";

// ---------------------
// Metadata errors
// ---------------------
export class MetadataUnauthorizedError extends SDKError {
  constructor() {
    super("Unauthorized controller");
  }
}

export class TargetFrozenError extends SDKError {
  constructor() {
    super("Target is frozen");
  }
}

export class InvalidVersionIncrementError extends SDKError {
  constructor() {
    super("Invalid metadata version increment");
  }
}

export class AlreadyLockedError extends SDKError {
  constructor() {
    super("Metadata already locked");
  }
}

export class VersionOverflowError extends SDKError {
  constructor() {
    super("Version overflow");
  }
}

export class InvalidVersionError extends SDKError {
  constructor() {
    super("Invalid version");
  }
}
