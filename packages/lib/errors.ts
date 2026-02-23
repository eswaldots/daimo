export enum ErrorCode {
  // Generic HTTP error codes for transport-agnostic error handling
  Unauthorized = "unauthorized_error",
  Forbidden = "forbidden_error",
  NotFound = "not_found_error",
  // Domain specific errors
  NoProfileSelected = "no_profile_selected_error",
}
