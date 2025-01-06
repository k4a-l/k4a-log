type SearchParams = Promise<{ query: string }>;

export default async function Page({
	searchParams,
}: { searchParams: SearchParams }) {
	const { query } = await searchParams;
	const queryDecoded = decodeURIComponent(query ?? "");

	return <div>Search: {queryDecoded}</div>;
}
