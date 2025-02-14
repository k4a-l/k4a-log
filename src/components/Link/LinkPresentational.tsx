"use client";

import { SearchIcon } from "lucide-react";
import {
	type FC,
	type PropsWithChildren,
	useEffect,
	useRef,
	useState,
} from "react";

import { getSearchPath } from "@/app/search/util";
import { NextLink, NextLinkIconButton } from "@/components/Link/NextLink";
import { toNoteHref } from "@/features/metadata/constant";
import { Link } from "@/park-ui/components/link";
import { css } from "styled-system/css";
import { HStack } from "styled-system/jsx";

import type { WikiLinkData } from "@/types/mdast";
import type { StrictOmit } from "ts-essentials";

type LinkPresentationalType = StrictOmit<
	WikiLinkData["hProperties"],
	"assetsDirPath" | "type" | "parentsLinks"
>;

export type MDLinkPresentationalType =
	PropsWithChildren<LinkPresentationalType>;

const TransitionLinkContainer: FC<
	PropsWithChildren<Pick<WikiLinkData["hProperties"], "isTagLink" | "href">>
> = ({ isTagLink, href, children }) => {
	if (!isTagLink) return children;

	return (
		<HStack
			alignItems={"stretch"}
			bg="gray.2"
			borderColor={"blue.5"}
			borderRadius={"md"}
			borderWidth={1}
			display={"inline-flex"}
			gap={1}
			m={0.5}
			pl={2}
		>
			{children}
			<NextLinkIconButton
				borderRadius={"none"}
				className={css({ _hover: { "& > *": { transform: "scale(1.2)" } } })}
				colorPalette={"blue"}
				colorScheme={"blue"}
				h="auto"
				href={getSearchPath({ hasLink: href })}
				minW="2em"
				p={"0.2em"}
				size="xs"
				variant={"subtle"}
			>
				<SearchIcon
					className={css({
						transition: "0.2s",
						w: "0.8em",
						h: "0.8em",
					})}
				/>
			</NextLinkIconButton>
		</HStack>
	);
};
export const TransitionLinkDead: FC<
	PropsWithChildren<MDLinkPresentationalType>
> = ({ href, children, isTagLink, alias, title, ...others }) => {
	return (
		<TransitionLinkContainer href={href} isTagLink={isTagLink}>
			<Link
				_hover={{
					textDecorationColor: "blue.10",
					textDecorationStyle: "solid",
					textDecorationThickness: "2px",
				}}
				asChild
				colorPalette={"gray"}
				fontWeight={"inherit"}
				textDecoration={"underline"}
				textDecorationColor={"blue.7"}
				textDecorationStyle={"dashed"}
				textDecorationThickness={"1px"}
			>
				<NextLink
					{...others}
					href={getSearchPath({ hasLink: href })}
					style={{ cursor: "help" }}
				>
					{children}
				</NextLink>
			</Link>
		</TransitionLinkContainer>
	);
};

export const TransitionLinkExist: FC<MDLinkPresentationalType> = ({
	href,
	children,
	alias,
	title,
	isTagLink,
	...others
}) => {
	return (
		<TransitionLinkContainer href={title} isTagLink={isTagLink}>
			<Link asChild color={"blue.10"} fontWeight={"inherit"}>
				<NextLink href={href.startsWith("#") ? href : toNoteHref(href)}>
					{alias ?? title ?? children}
				</NextLink>
			</Link>
		</TransitionLinkContainer>
	);
};

export const EmbedLinkNotFound = ({ title }: { title: string }) => {
	return (
		<span
			className={css({
				borderWidth: 1,
				borderColor: "white",
				bg: "black.a1",
				px: 2,
				py: 1,
				rounded: "sm",
				fontWeight: "light",
			})}
		>
			&quot;{title}&quot; が存在しません
		</span>
	);
};

export const EmbedLinkImage: FC<PropsWithChildren<LinkPresentationalType>> = ({
	href,
	title,
	alias,
	children,
	...others
}) => {
	const size = Number(alias);

	return (
		<img
			{...others}
			alt={title}
			className={css({
				maxW: "100%",
				objectFit: "contain",
				w: "auto",
			})}
			loading={"lazy"}
			src={href || ":"}
			style={{ width: Number.isNaN(size) ? "auto" : size }}
		/>
	);
};

export const EmbedLinkVideo: FC<PropsWithChildren<LinkPresentationalType>> = ({
	href,
	title,
	alias,
	children,
	...others
}) => {
	return (
		<video
			{...others}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
			controls
			poster=""
			preload="metadata"
			src={href || ":"}
		/>
	);
};

export const EmbedLinkPdf: FC<PropsWithChildren<LinkPresentationalType>> = ({
	href,
	title,
	alias,
	children,
	...others
}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [iframeHeight, setIframeHeight] = useState<number>(500); // 初期高さを500pxに設定

	useEffect(() => {
		const adjustHeight = () => {
			if (iframeRef.current) {
				const pdfDocument = iframeRef.current.contentDocument;
				const pdfBodyHeight = pdfDocument?.body.scrollHeight || 0;

				if (pdfBodyHeight < 500) {
					setIframeHeight(500);
				} else if (pdfBodyHeight <= 1000) {
					setIframeHeight(pdfBodyHeight);
				} else {
					setIframeHeight(1000);
				}
			}
		};

		// iframe内のPDFが読み込まれたら高さを調整
		if (iframeRef.current) {
			iframeRef.current.onload = adjustHeight;
		}
	}, []);

	return (
		<iframe
			{...others}
			className={css({ w: "100%", maxH: "1000px" })}
			loading="lazy"
			ref={iframeRef}
			src={href || ":"}
			style={{ height: `${iframeHeight}px` }}
		/>
	);
};
