export default async function Page({
	searchParams,
}: { searchParams: { query: string } }) {
	const { query } = await searchParams;
	const queryDecoded = decodeURIComponent(query ?? "");

	return <div>Search: {queryDecoded}</div>;
}
