"use client";

import type { WikiLinkData } from "@/types/mdast";
import NextLink from "next/link";
import {
	type FC,
	type PropsWithChildren,
	useEffect,
	useRef,
	useState,
} from "react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import { IconButton } from "@/park-ui/components/icon-button";
import { Link } from "@/park-ui/components/link";
import { Link as LinkIcons } from "lucide-react";
import path from "path-browserify";
import type { StrictOmit } from "ts-essentials";

type LinkPresentationalType = StrictOmit<
	WikiLinkData["hProperties"],
	"rootDirPath" | "assetsDirPath" | "type" | "parentsLinks"
>;
export const TransitionLinkDead: FC<
	PropsWithChildren<LinkPresentationalType>
> = ({ href, children, ...others }) => {
	return (
		<Link asChild color="blue.9">
			<NextLink
				{...others}
				href={path.join("/search", `?query=hasLink:${href}`)}
				scroll={false}
				style={{ cursor: "help" }}
			>
				{children}
			</NextLink>
		</Link>
	);
};

export const TransitionLinkExist: FC<
	PropsWithChildren<LinkPresentationalType>
> = ({ href, children, alias, title, ...others }) => {
	return (
		<Link asChild color={"blue.10"}>
			<NextLink href={href}>{alias ?? title ?? children}</NextLink>
		</Link>
	);
};

const EmbedLinkNotFound = ({ title }: { title: string }) => {
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
			"{title}" が存在しません
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
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	const size = Number(alias);

	return (
		<img
			{...others}
			src={href || ":"}
			loading={"lazy"}
			alt={title}
			style={{ width: Number.isNaN(size) ? "auto" : size }}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
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
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	return (
		<video
			{...others}
			controls
			preload="metadata"
			poster=""
			src={href || ":"}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
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
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

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
			src={href || ":"}
			loading="lazy"
			className={css({ w: "100%", maxH: "1000px" })}
			ref={iframeRef}
			style={{ height: `${iframeHeight}px` }}
		/>
	);
};

export const EmbedLinkMarkdown: FC<
	PropsWithChildren<LinkPresentationalType>
> = ({ href, title, alias, children }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	return (
		<Stack
			className={css({
				shadow: "sm",
				borderLeftWidth: 4,
				borderStyle: "solid",
				borderLeftColor: "gray.8",
				w: "100%",
				my: 2,
			})}
		>
			<HStack
				justifyContent={"space-between"}
				className={css({
					borderBottomWidth: "1",
					borderBottomColor: "gray.3",
					px: 2,
					py: 1,
				})}
			>
				<span
					className={css({
						fontWeight: "bold",
						fontSize: "lg",
					})}
				>
					{alias ?? title}
				</span>
				<IconButton asChild color="blue.10" variant={"ghost"} size="sm">
					<NextLink href={href}>
						<LinkIcons size={"1em"} />
					</NextLink>
				</IconButton>
			</HStack>
			<span
				className={css({
					maxH: "600px",
					overflow: "auto",
					scrollbarWidth: "thin",
					px: 2,
					pb: 1,
				})}
			>
				{children}
			</span>
		</Stack>
	);
};
