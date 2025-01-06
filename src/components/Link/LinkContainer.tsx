import type { WikiLinkData } from "@/types/mdast";
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from "react";

import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { getFileContent } from "@/features/remark/wikilink/file";
import { createFileTrees } from "@/features/remark/wikilink/util";
import path from "path-browserify";
import { css } from "styled-system/css";
import {
	EmbedLinkImage,
	EmbedLinkMarkdown,
	EmbedLinkPdf,
	EmbedLinkVideo,
	TransitionLinkDead,
	TransitionLinkExist,
} from "./LinkPresentational";

export const LinkContainer: FC<
	AnchorHTMLAttributes<HTMLAnchorElement> & WikiLinkData["hProperties"]
> = (props) => {
	const { href, children, "is-embed": isEmbed, ...others } = props;

	if (isEmbed) {
		return <EmbedLinkContainer {...props} />;
	}

	return <TransitionLinkContainer {...props} />;
};

export const TransitionLinkContainer: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = ({ rootDirPath, assetsDirPath, parentsLinks, ...props }) => {
	const { href } = props;
	if (!href) {
		return <TransitionLinkDead {...props} />;
	}

	return <TransitionLinkExist {...props} />;
};

export const EmbedLinkContainer: FC<
	PropsWithChildren<WikiLinkData["hProperties"]>
> = async ({ rootDirPath, assetsDirPath, parentsLinks, type, ...props }) => {
	const { href, children, title, alias, ...others } = props;

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
		const rootPath = path.join(assetsDirPath, rootDirPath);
		const fileTrees = createFileTrees(rootPath);

		const parentLinksArr = parentsLinks
			.split(" ")
			.map((p) => decodeURIComponent(p));

		const remarkProcessor = createParseProcessor(fileTrees, parentLinksArr);
		const rehypeProcessor = createRunProcessor();
		const stringifyProcessor = createStringifyProcessor();
		const data = await getFileContent(
			paths,
			rootPath,
			remarkProcessor,
			rehypeProcessor,
			stringifyProcessor,
		);

		return <EmbedLinkMarkdown {...props}>{data.content}</EmbedLinkMarkdown>;
	}

	return (
		<span
			{...others}
			className={css({ bg: "black.a2", px: 2, py: 1, rounded: "md" })}
		>
			{alias ?? `⚠️${title}: を埋め込み表示できません`}
		</span>
	);
};
