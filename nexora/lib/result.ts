export type ServiceErrorCode =
  | "not_found"
  | "conflict"
  | "validation"
  | "internal";

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
};

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E extends { code: string; message: string } = ServiceError> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<
  T,
  E extends { code: string; message: string } = ServiceError,
> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E extends { code: string; message: string } = ServiceError>(
  error: E
): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E extends { code: string; message: string }>(
  result: Result<T, E>
): result is Ok<T> {
  return result.ok === true;
}

export function isErr<T, E extends { code: string; message: string }>(
  result: Result<T, E>
): result is Err<E> {
  return result.ok === false;
}

export function unwrap<T, E extends { code: string; message: string }>(
  result: Result<T, E>
): T {
  if (isOk(result)) return result.value;
  throw new Error(`${result.error.code}: ${result.error.message}`);
}
