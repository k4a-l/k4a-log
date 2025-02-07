import path from "path-browserify";

import { notesDirPath } from "@/features/metadata/constant";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { getFileContent } from "@/features/remark/processor/getContent";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { css } from "styled-system/css";

import {
	EmbedLinkImage,
	EmbedLinkMarkdown,
	EmbedLinkPdf,
	EmbedLinkVideo,
	TransitionLinkDead,
	TransitionLinkExist,
} from "./LinkPresentational";

import type { MetaProps, PathMap } from "@/features/metadata/type";
import type { WikiLinkData } from "@/types/mdast";
import type { AnchorHTMLAttributes, FC } from "react";
import { safeDecodeURIComponent } from "@/utils/path";

type WikiLinkComponentProps = AnchorHTMLAttributes<HTMLAnchorElement> &
	WikiLinkData["hProperties"] & { pathMap: PathMap };

export const LinkContainer: FC<WikiLinkComponentProps & MetaProps> = (
	props,
) => {
	const { href, children, "is-embed": isEmbed, alias, ...others } = props;

	if (isEmbed) {
		return <EmbedLinkContainer {...props} />;
	}

	return <TransitionLinkContainer {...props} />;
};

export const TransitionLinkContainer: FC<WikiLinkComponentProps> = ({
	rootDirPath,
	assetsDirPath,
	parentsLinks,
	isDeadLink,
	...props
}) => {
	if (isDeadLink === "true") {
		return <TransitionLinkDead {...props} />;
	}

	return <TransitionLinkExist {...props} />;
};

export const EmbedLinkContainer: FC<
	WikiLinkComponentProps & MetaProps
> = async ({
	rootDirPath,
	assetsDirPath,
	parentsLinks,
	isDeadLink,
	type,
	pathMap,
	vault,
	note,
	...props
}) => {
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
		const paths = href.split(/\\|\//).filter((p) => p !== notesDirPath);
		const rootPath = path.join(assetsDirPath, rootDirPath);

		const parentLinksArr = parentsLinks
			.split(" ")
			.map((p) => safeDecodeURIComponent(p));

		const remarkProcessor = createParseProcessor(
			parentLinksArr,
			[...vault.notes, ...vault.assets].map((p) => ({
				absPath: p.path,
				name: p.basename,
			})),
		);
		const rehypeProcessor = createRunProcessor({
			listItems: note.metadata.listItems,
		});
		const stringifyProcessor = createStringifyProcessor({
			pathMap,
			meta: {
				vault,
				note: note,
			},
		});
		const data = getFileContent(
			paths,
			rootPath,
			remarkProcessor,
			rehypeProcessor,
			stringifyProcessor,
		);

		if (!data) {
			return <EmbedLinkMarkdown pathMap={pathMap} {...props} href={""} />;
		}

		return (
			<EmbedLinkMarkdown pathMap={pathMap} {...props}>
				{data.content}
			</EmbedLinkMarkdown>
		);
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
