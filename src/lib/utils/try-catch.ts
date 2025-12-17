// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Wraps a promise and produces a Result object representing success or failure.
 *
 * @param promise - The promise to await.
 * @returns `Result<T, E>` with `data` set to the resolved value and `error` set to `null` on success; `data` set to `null` and `error` set to the caught error of type `E` on failure.
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}