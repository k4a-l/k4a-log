import { ErrorBoundary } from "react-error-boundary";
import {
	EmbeddedCardError,
	EmbeddedCardPresentational,
} from "./Presentational";

import metaFetcher from "meta-fetcher";

import { YouTubeEmbed } from "@next/third-parties/google";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

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
					<YouTubeEmbed videoid={id} height={400} params="controls=1" />
					<a
						href={url}
						target="blank"
						className={css({
							fontSize: "0.5em",
							color: "",
						})}
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
			url={url}
			title={metadata.metadata.title}
			description={metadata.metadata.description}
			website={metadata.metadata.website}
			banner={metadata.metadata.banner}
			favicons={metadata.favicons}
		/>
	);
};

export { EmbeddedLinkWithBoundary as EmbeddedLink };
