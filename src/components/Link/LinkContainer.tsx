import type { WikiLinkData } from "@/types/mdast";
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from "react";

import { createProcessor } from "@/wikilink/processor";
import {
	createFileTrees,
	directoryPath,
	getFileContent,
} from "@/wikilink/util";
import NextLink from "next/link";
import { css } from "styled-system/css";
import {
	EmbedLinkImage,
	EmbedLinkMarkdown,
	EmbedLinkPdf,
	EmbedLinkVideo,
	TransitionLinkDead,
} from "./LinkPrentational";

export const LinkContainer: FC<
	AnchorHTMLAttributes<HTMLAnchorElement> & WikiLinkData["hProperties"]
> = (props) => {
	const { href, children, "is-embed": isEmbed, ...others } = props;

	if (isEmbed) {
		return <EmbedLinkPresentation {...props} />;
	}

	return <LinkPresentation {...props} />;
};

export const LinkPresentation: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = (props) => {
	const { href, children, alias, title } = props;
	if (!href) {
		return <TransitionLinkDead {...props} />;
	}

	return <NextLink href={href}>{alias ?? title ?? children}</NextLink>;
};

export const EmbedLinkPresentation: FC<
	PropsWithChildren<WikiLinkData["hProperties"] & { title: string }>
> = async (props) => {
	const { href, children, type, title, ...others } = props;

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
		const paths = href.split("\\").slice(1);
		console.log(paths);
		const fileTrees = createFileTrees(directoryPath);
		const currentPaths = ["SYNTAX TEST", "COMMON"];
		const processor = createProcessor(fileTrees, currentPaths);
		const data = await getFileContent(paths, directoryPath, processor);

		return <EmbedLinkMarkdown {...props}>{data}</EmbedLinkMarkdown>;
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
