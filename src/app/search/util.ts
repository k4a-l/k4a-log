export const searchPath = "/search";

export type SearchQuery = Partial<{
	query: string;
	tag: string;
	page: number;
	created: string;
	sort: string;
	includesTests: string;
	hasLink: string;
}>;

export const searchQueryKey = {
	tag: "tag",
	created: "created",
	page: "page",
	query: "query",
	sort: "sort",
	includesTests: "includesTests",
	hasLink: "hasLink",
} satisfies Record<keyof SearchQuery, string>;

export const getSearchPath = (
	searchQuery: SearchQuery,
	currentURLSearchParams?: URLSearchParams,
) => {
	const searchParams = currentURLSearchParams ?? new URLSearchParams();
	if (searchQuery.tag) {
		searchParams.set(searchQueryKey.tag, encodeURIComponent(searchQuery.tag));
	}
	if (searchQuery.query) {
		searchParams.set(
			searchQueryKey.query,
			encodeURIComponent(searchQuery.query),
		);
	}
	if (searchQuery.page) {
		searchParams.set(searchQueryKey.page, searchQuery.page.toString());
	}
	if (searchQuery.created) {
		const { year, month } = fromDateParamString(searchQuery.created) ?? {};
		if (year) {
			searchParams.set(
				searchQueryKey.created,
				`${year}${month ? `-${month}` : ""}`,
			);
		}
	}
	if (searchQuery.sort) {
		searchParams.set(searchQueryKey.sort, searchQuery.sort);
	}

	if (searchQuery.hasLink) {
		searchParams.set(
			searchQueryKey.hasLink,
			searchQuery.hasLink.replace(/^\//, ""),
		);
	}

	return `${searchPath}?${searchParams.toString()}`;
};

export const toDateParamString = ({
	year,
	month,
}: { year: number; month?: number }): string => {
	return `${year}${month ? `-${month}` : ""}`;
};

export const fromDateParamString = (
	date: string,
): { year: number; month?: number } | undefined => {
	const [year, month] = date.split("-");

	if (!year) return undefined;

	return {
		year: Number.parseInt(year),
		month: month ? Number.parseInt(month) : undefined,
	};
};
