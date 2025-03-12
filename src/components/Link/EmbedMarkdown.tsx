// "use client";

import { LinkIcon } from "lucide-react";

import { getVaultObject } from "@/features/file/io";
import { toNoteHref } from "@/features/metadata/constant";
import {
	createParseProcessor,
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { getFileContent } from "@/features/remark/processor/getContent";
import { IconButton } from "@/park-ui/components/icon-button";
import { isSamePath, safeDecodeURIComponent } from "@/utils/path";
import { css } from "styled-system/css";
import { Stack, HStack } from "styled-system/jsx";

import { embedMarkdownClass } from "../Toc";

import { EmbedLinkNotFound } from "./LinkPresentational";
import { NextLink } from "./NextLink";

import type { WikiLinkData } from "@/types/mdast";
import type { FC, PropsWithChildren } from "react";

export const EmbedLinkMarkdownLayout: FC<
	PropsWithChildren<{ title: string; href: string }>
> = ({ href, title, children }) => {
	if (!href) {
		return <EmbedLinkNotFound title={title} />;
	}
	return (
		<Stack
			className={`${css({
				borderWidth: 1,
				borderColor: "gray.3",
				w: "100%",
			})}, ${embedMarkdownClass}`}
			my={2}
		>
			<HStack
				className={css({
					borderBottomWidth: "1",
					borderBottomColor: "gray.3",
					px: 2,
					py: 1,
				})}
				justifyContent={"space-between"}
			>
				<span
					className={css({
						fontWeight: "bold",
						fontSize: "1em",
					})}
				>
					{title}
				</span>
				<IconButton asChild color="blue.10" size="xs" variant={"ghost"}>
					<NextLink href={toNoteHref(href)}>
						<LinkIcon size={"1em"} />
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
					fontWeight: "normal",
					fontSize: { sm: "1rem", base: "0.8rem" },
				})}
			>
				{children}
			</span>
		</Stack>
	);
};

type Props = Pick<
	WikiLinkData["hProperties"],
	"alias" | "href" | "title" | "parentsLinks"
>;
export const EmbedLinkMarkdown: FC<Props> = async (props) => {
	const { parentsLinks, href, title, alias } = props;

	await new Promise((resolve) => setTimeout(resolve, 100)); // 強制遅延

	const { notes, pathMap, assets } = getVaultObject();

	const note = notes.find((p) => isSamePath(p.path, href));

	if (!note) return <EmbedLinkNotFound title={title} />;

	const vaultPaths = [...notes, ...assets].map((p) => ({
		absPath: p.path,
		name: p.basename,
	}));

	const paths = href.split(/\\|\//);

	const parentLinksArr = parentsLinks
		.split(" ")
		.map((p) => safeDecodeURIComponent(p));

	const remarkProcessor = createParseProcessor(
		parentLinksArr,
		vaultPaths,
		pathMap,
	);
	const rehypeProcessor = createRunProcessor({
		listItems: note.metadata.listItems,
	});
	const stringifyProcessor = createStringifyProcessor();

	const data = getFileContent(
		paths,
		remarkProcessor,
		rehypeProcessor,
		stringifyProcessor,
	);

	if (!data) return <EmbedLinkNotFound title={title} />;

	return data.content;
};
