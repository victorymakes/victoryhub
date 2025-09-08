// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => Promise<any>;

class InMemoryCache {
    private store = new Map<
        string,
        { value?: unknown; promise?: Promise<unknown> }
    >();

    get(key: string) {
        return this.store.get(key);
    }

    has(key: string) {
        return this.store.has(key);
    }

    setValue(key: string, value: unknown) {
        this.store.set(key, { value });
    }

    setPromise(key: string, promise: Promise<unknown>) {
        this.store.set(key, { promise });
    }

    delete(key: string) {
        this.store.delete(key);
    }
}

const memoryCache = new InMemoryCache();

function keyFrom(keys: string[]): string {
    return keys.join("-");
}

function unstable_cache<T extends Callback>(cb: T, keyParts: string[] = []): T {
    const key = keyFrom(keyParts);

    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const entry = memoryCache.get(key);
        if (entry) {
            if (entry.promise) return entry.promise as Promise<ReturnType<T>>;
            if ("value" in entry) return entry.value as ReturnType<T>;
        }

        // Cache miss: start computation and store the promise immediately
        // so concurrent callers await the same work.
        const p = (async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const val = await cb(...(args as any));
                memoryCache.setValue(key, val);
                return val as ReturnType<T>;
            } catch (e) {
                // On failure, remove the entry so subsequent calls can retry.
                memoryCache.delete(key);
                throw e;
            }
        })();

        memoryCache.setPromise(key, p as Promise<unknown>);
        return p as Promise<ReturnType<T>>;
    }) as T;
}

export function cache<T extends Callback>(cb: T, keyParts: string[] = []): T {
    if (keyParts.length === 0) {
        throw new Error("Cache key is required");
    }
    const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        console.log(
            `[IN-MEMORY-CACHE] Cache mismatched. Fetch with keys: ${keyFrom(keyParts)} `,
        );
        return cb(...args);
    };
    return unstable_cache(wrapped, keyParts) as T;
}
