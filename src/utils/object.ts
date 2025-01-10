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
