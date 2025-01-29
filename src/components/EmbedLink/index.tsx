import { YouTubeEmbed } from "@next/third-parties/google";
import metaFetcher from "meta-fetcher";
import { ErrorBoundary } from "react-error-boundary";

import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import {
	EmbeddedCardError,
	EmbeddedCardPresentational,
} from "./Presentational";

import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

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

const EmbeddedLink = async ({
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

	const metadata = await metaFetcher(url);

	return (
		<EmbeddedCardPresentational
			banner={metadata.metadata.banner}
			description={metadata.metadata.description}
			favicons={metadata.favicons}
			title={metadata.metadata.title}
			url={url}
			website={metadata.metadata.website}
		/>
	);
};

export { EmbeddedLinkWithBoundary as EmbeddedLink };
