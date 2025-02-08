import { YouTubeEmbed } from "@next/third-parties/google";
import { ErrorBoundary } from "react-error-boundary";

import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import { EmbeddedCardError } from "./Presentational";

import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Link } from "@/park-ui/components/link";
import { NextLink } from "@/components/Link/NextLink";

const EmbeddedLinkWithBoundary = async ({
	href,
	children,
	...other
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	if (!href) return;

	return (
		<ErrorBoundary fallback={<EmbeddedCardError url={href} />}>
			<EmbeddedLink url={href}>{children}</EmbeddedLink>
		</ErrorBoundary>
	);
};

const EmbeddedLink = ({
	url,
	children,
}: PropsWithChildren<{ url: string }>) => {
	const urlObj = new URL(url);

	if (urlObj.hostname === "www.youtube.com" && urlObj.pathname === "/watch") {
		const id = urlObj.searchParams.get("v");
		if (id) {
			return (
				<Stack>
					<YouTubeEmbed height={400} params="controls=1" videoid={id} />
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
				</Stack>
			);
		}
	}

	// const metadata = await metaFetcher(url);

	return (
		<Link asChild color={"blue.10"}>
			<NextLink href={url}>{url}</NextLink>
		</Link>
	);

	// return (
	// 	<EmbeddedCardPresentational
	// 		banner={metadata.metadata.banner}
	// 		description={metadata.metadata.description}
	// 		favicons={metadata.favicons}
	// 		title={metadata.metadata.title}
	// 		url={url}
	// 		website={metadata.metadata.website}
	// 	/>
	// );
};

export { EmbeddedLinkWithBoundary as EmbeddedLink };
