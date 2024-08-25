type ValueOrNil<V> = V | null | undefined;

export const addObjectField = <T extends object, K extends PropertyKey, V>(
	obj: T,
	key: K,
	value: ValueOrNil<V>,
): T | (T & Record<K, V>) =>
	value === null || value === undefined
		? obj
		: ({ ...obj, [key]: value } as T & Record<K, V>);
