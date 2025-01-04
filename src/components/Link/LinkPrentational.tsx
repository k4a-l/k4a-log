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
import { TodoComponent } from "../Todo";

export const LinkPresentation: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ href, children, "is-embed": isEmbed, ...others }) => {
	if (!href) {
		return (
			<NextLink
				{...others}
				href={":"}
				scroll={false}
				style={{ color: "gray", cursor: "pointer" }}
				onClick={(e) => {
					e.preventDefault();
				}}
			>
				{children}
			</NextLink>
		);
	}

	return <NextLink href={href}>{children}</NextLink>;
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

const EmbedLinkImage: FC<PropsWithChildren<WikiLinkData["hProperties"]>> = ({
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
			alt={title}
			style={{ width: Number.isNaN(size) ? "auto" : size }}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
		/>
	);
};

const EmbedLinkVideo: FC<PropsWithChildren<WikiLinkData["hProperties"]>> = ({
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
			src={href || ":"}
			className={css({
				maxW: "100%",
				objectFit: "contain",
			})}
		/>
	);
};

const EmbedLinkPdf: FC<PropsWithChildren<WikiLinkData["hProperties"]>> = ({
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
			className={css({ w: "100%", maxH: "1000px" })}
			ref={iframeRef}
			style={{ height: `${iframeHeight}px` }}
		/>
	);
};

const EmbedLinkMarkdown: FC<PropsWithChildren<WikiLinkData["hProperties"]>> = ({
	href,
	title,
	alias,
	children,
	...others
}) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}

	return <TodoComponent>MARKDOWNの埋め込み</TodoComponent>;

	// return <NextLink href={href}>{children}</NextLink>;
};

export const EmbedLinkPresentation: FC<
	PropsWithChildren<WikiLinkData["hProperties"] & { title: string }>
> = (props) => {
	const { href, children, type, "is-embed": isEmbed, title, ...others } = props;

	if (type === "img") {
		return <EmbedLinkImage {...props} />;
	}

	if (type === "video") {
		return <EmbedLinkVideo {...props} />;
	}

	if (type === "pdf") {
		return <EmbedLinkPdf {...props} />;
	}

	if (type === "link") {
		return <EmbedLinkMarkdown {...props} />;
	}

	return (
		<span
			{...others}
			className={css({ bg: "black.a2", px: 2, py: 1, rounded: "md" })}
		>
			⚠️{title}: を埋め込み表示できません
		</span>
	);
};
