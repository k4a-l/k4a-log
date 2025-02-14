import useSWR from "swr";

export async function fetcher(url: string) {
	await new Promise((resolve) => setTimeout(resolve, 300));
}

export const usePromise = (url: string) => {
	return useSWR([url], ([url]) => fetcher(url));
};
