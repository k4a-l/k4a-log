export const toYYYYMMDD = (date: Date) => {
	return date
		.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
		.replaceAll("/", "-");
};

export const stringToDate = (str: string): Date | undefined => {
	const date = str ? new Date(String(str)) : undefined;
	return date;
};
