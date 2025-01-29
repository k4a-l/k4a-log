export const strictEntries = <T extends Record<string, unknown>>(
	object: T,
): [keyof T, T[keyof T]][] => {
	return Object.entries(object) as [keyof T, T[keyof T]][];
};

export const strictFromEntries = <K extends string, T>(
	array: [K, T][],
): Record<K, T> => {
	return Object.fromEntries(array) as Record<K, T>;
};

export const reverseObjects = <T extends Record<string, string>>(t: T) => {
	return Object.fromEntries(
		Object.entries(t).map(([key, value]) => [value, key]),
	);
};
