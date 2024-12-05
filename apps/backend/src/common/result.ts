export type Result<T, E = Error> = Ok<T> | Err<E>;

export class Ok<T> {
    readonly _tag = 'Ok';
    constructor(readonly value: T) {}

    isOk(): this is Ok<T> {
        return true;
    }

    isErr(): this is never {
        return false;
    }

    map<U>(fn: (value: T) => U): Result<U, never> {
        return new Ok(fn(this.value));
    }

    andThen<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
        return fn(this.value);
    }

    unwrap(): T {
        return this.value;
    }

    unwrapOr(_default: T): T {
        return this.value;
    }
}

export class Err<E> {
    readonly _tag = 'Err';
    constructor(readonly error: E) {}

    isOk(): this is never {
        return false;
    }

    isErr(): this is Err<E> {
        return true;
    }

    map<U>(_fn: (value: never) => U): Result<never, E> {
        return this;
    }

    andThen<U>(_fn: (value: never) => Result<U, E>): Result<never, E> {
        return this;
    }

    unwrap(): never {
        throw this.error;
    }

    unwrapOr<T>(defaultValue: T): T {
        return defaultValue;
    }
}

export const ok = <T>(value: T): Ok<T> => new Ok(value);
export const err = <E>(error: E): Err<E> => new Err(error);

export const tryAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
    try {
        const value = await fn();
        return ok(value);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
};
