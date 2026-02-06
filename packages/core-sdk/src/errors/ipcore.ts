// ---------------------
// IP Asset errors

import { SDKError } from "./base";

// ---------------------
export class ParentApprovalRequiredError extends SDKError {
  constructor() {
    super("Parent entity approval required");
  }
}

export class InvalidTreasuryAccountError extends SDKError {
  constructor() {
    super("Invalid treasury account");
  }
}

export class UnauthorizedRegistryError extends SDKError {
  constructor() {
    super("Caller is not registry authority");
  }
}

export class RegistrationFeeError extends SDKError {
  constructor() {
    super("Registration fee does not match");
  }
}

export class IPFreezeError extends SDKError {
  constructor() {
    super("IP Already Frozen");
  }
}
