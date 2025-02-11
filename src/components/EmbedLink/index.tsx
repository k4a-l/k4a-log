import { YouTubeEmbed } from "@next/third-parties/google";
import { ErrorBoundary } from "react-error-boundary";

import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import ogs from "open-graph-scraper";

import {
	EmbeddedCardError,
	EmbeddedCardPresentational,
} from "./Presentational";

import {
	Suspense,
	type AnchorHTMLAttributes,
	type PropsWithChildren,
} from "react";
import { Spinner } from "@/park-ui/components/spinner";
import { Link } from "@/park-ui/components/link";
import { NextLink } from "@/components/Link/NextLink";

const EmbeddedLinkWithBoundary = ({
	href,
	children,
	...other
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	if (!href) return;

	if (typeof window !== "undefined") {
		return (
			<Link asChild color={"blue.10"}>
				<NextLink href={href}>{children}</NextLink>
			</Link>
		);
	}

	return (
		<ErrorBoundary fallback={<EmbeddedCardError url={href} />}>
			<Suspense fallback={<Spinner />}>
				<EmbeddedLink url={href}>{children}</EmbeddedLink>
			</Suspense>
		</ErrorBoundary>
	);
};

const EmbeddedLink = async ({
	url,
	children,
}: PropsWithChildren<{ url: string }>) => {
	const urlObj = new URL(url);

	if (urlObj.hostname === "www.youtube.com" && urlObj.pathname === "/watch") {
		const id = urlObj.searchParams.get("v");
		if (id) {
			return (
				<Stack gap={0}>
					<a
						className={css({
							fontSize: "0.5em",
							color: "",
						})}
						href={url}
						target="blank"
					>
						{children}
					</a>
					<YouTubeEmbed height={400} params="controls=1" videoid={id} />
				</Stack>
			);
		}
	}

	const ogObject = await ogs({
		url,
		fetchOptions: new URL(url).hostname.match(/x.com|twitter.com/)
			? { headers: { "User-Agent": "bot" } }
			: {},
	});

	return <EmbeddedCardPresentational url={url} ogpData={ogObject.result} />;
};

export { EmbeddedLinkWithBoundary as EmbeddedLink };
