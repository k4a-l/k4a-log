import type { AppType } from "@/app/api/[[...route]]/route";
import type { InferResponseType } from "hono";
import { hc } from "hono/client";
import { useMemo } from "react";
import useSWR from "swr";

export const client = hc<AppType>(
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	process.env.URL!,
);

export async function fetcher<T>(
	url: URL,
	queryParams?: {
		[key: string]: string;
	},
) {
	const searchParams = new URLSearchParams();
	if (queryParams) {
		for (const [key, value] of Object.entries(queryParams)) {
			if (!value) continue;
			searchParams.append(key, value);
		}
	}

	const response = await fetch(`${url}?${searchParams.toString()}`);
	return response.json() as Promise<T>;
}

export const useHonoQuery = <T extends keyof typeof client.api>(
	url: T,
	queryParams?: {
		[key: string]: string | undefined;
	},
) => {
	const abUrl = useMemo(() => client.api[url].$url(), [url]);

	type ResType = InferResponseType<(typeof client.api)[typeof url]["$get"]>;
	return useSWR<ResType, unknown, typeof queryParams>(
		[abUrl, queryParams],
		([url, queryParams]) => fetcher(url, queryParams),
	);
};
