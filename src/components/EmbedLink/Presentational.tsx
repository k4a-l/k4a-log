"use client";
import { Link } from "@/park-ui/components/link";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import type { OgObject } from "open-graph-scraper/dist/lib/types";

export const EmbeddedCardPresentational = ({
	url,
	ogpData,
}: { url: string; ogpData: OgObject }) => {
	const urls =
		ogpData.ogImage
			?.map((image) => image.url)
			.filter((url) => url != null && url !== undefined) ?? [];

	const title = ogpData.ogTitle
		? ogpData.ogTitle.includes("�")
			? url
			: ogpData.ogTitle
		: "";

	// https://zenn.dev/team_zenn/articles/opengraphscraper-commit の対応で6.4.0に上げれば解決できそうだが、6.0.0から上げられない問題が別途ある（https://zenn.dev/st43/scraps/ac20e59cf6614b）のでデッドロック 他のライブラリでも無理だった。
	const description = ogpData.ogDescription
		? ogpData.ogDescription.includes("�")
			? ""
			: ogpData.ogDescription
		: "";
	const imageUrl = findImageFromOgp(urls, url);

	return (
		<Container>
			<a
				className={css({
					display: "flex",
					justifyContent: "space-between",
					color: "inherit",
					textDecoration: "none",
				})}
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Stack
					className={css({
						flexShrink: 1,
						flexGrow: 0,
						w: "auto",
						overflow: "hidden",
					})}
					justifyContent={"space-between"}
					p={2}
				>
					<span
						className={css({
							fontWeight: "bold",
						})}
					>
						{title}
					</span>
					<span
						className={css({
							w: "auto",
							flexShrink: 1,
							fontSize: "0.8em",
							color: "gray.10",
							// textWrap: "nowrap",
							overflow: "hidden",
						})}
					>
						{description}
					</span>
					<HStack
						className={css({
							flexShrink: 0,
							flexGrow: 1,
						})}
					>
						{ogpData.favicon ? (
							<img
								alt={title}
								className={css({
									objectFit: "cover",
									height: "14px",
									maxWidth: "14px",
								})}
								src={
									ogpData.favicon.startsWith("http")
										? ogpData.favicon
										: new URL(ogpData.favicon, url).toString()
								}
							/>
						) : null}
						{new URL(url).hostname}
					</HStack>
				</Stack>
				{imageUrl ? (
					<img
						alt={title}
						className={css({
							objectFit: "cover",
							height: "120px",
							maxWidth: "230px",
						})}
						src={imageUrl}
					/>
				) : null}
			</a>
		</Container>
	);
};

// amazonが複数のOG画像を返してくるので、その対策
function findImageFromOgp(
	originalUrls: string[],
	domain: string,
): string | undefined {
	if (domain.includes("amazon") || domain.includes("amzn")) {
		const urls = originalUrls.filter((url) => {
			return url.includes("/I/") && url.includes("_SX") && url.includes("_SY");
		});
		return urls[0];
	}
	return originalUrls[0];
}

export const EmbeddedCardError = ({ url }: { url: string }) => {
	return (
		<Container>
			<Link
				className={css({
					display: "flex",
					p: 2,
					alignItems: "center",
					textDecoration: "none",
				})}
				colorScheme={"blue"}
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{url}
			</Link>
		</Container>
	);
};

const Container = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className={css({
				borderRadius: "md",
				borderWidth: 1,
				borderColor: "gray.3",
				w: "full",
				display: "inline-block",
				maxH: "120px",
				overflow: "hidden",
				_hover: {
					backgroundColor: "gray.2",
				},
			})}
		>
			{children}
		</div>
	);
};
