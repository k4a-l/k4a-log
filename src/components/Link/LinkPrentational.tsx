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

import { Link as LinkIcons } from "lucide-react";

export const TransitionLinkDead: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, children, ...others }) => {
	return (
		<NextLink
			{...others}
			href={":"}
			scroll={false}
			// todo: デッドリンクでも遷移して言及しているページ一覧表示にしたほうが良さそう
			style={{ color: "gray", cursor: "text" }}
			onClick={(e) => {
				e.preventDefault();
			}}
		>
			{children}
		</NextLink>
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

export const EmbedLinkImage: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, title, alias, children, ...others }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	const size = Number(alias);

	return (
		<img
			{...others}
			src={href || ":"}
			alt={title}
			style={{ width: Number.isNaN(size) ? "auto" : size }}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
		/>
	);
};

export const EmbedLinkVideo: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, title, alias, children, ...others }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	return (
		<video
			{...others}
			controls
			src={href || ":"}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
		/>
	);
};

export const EmbedLinkPdf: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, title, alias, children, ...others }) => {
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
			className={css({ w: "100%", maxH: "1000px" })}
			ref={iframeRef}
			style={{ height: `${iframeHeight}px` }}
		/>
	);
};

export const EmbedLinkMarkdown: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, title, alias, children }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	return (
		<Stack
			className={css({
				px: 2,
				py: 1,
				shadow: "sm",
				borderLeftWidth: 4,
				borderStyle: "solid",
				borderLeftColor: "gray.8",
			})}
		>
			<HStack
				justifyContent={"space-between"}
				className={css({ borderBottomWidth: "1", borderBottomColor: "gray.3" })}
			>
				<span
					className={css({
						fontWeight: "bold",
						fontSize: "lg",
					})}
				>
					{alias ?? title}
				</span>
				<NextLink href={href}>
					<LinkIcons size={"1em"} />
				</NextLink>
			</HStack>
			<span>{children}</span>
		</Stack>
	);

	// return <NextLink href={href}>{children}</NextLink>;
};
