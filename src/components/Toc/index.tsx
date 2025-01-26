"use client";

import type {
	BlockContent,
	DefinitionContent,
	List,
	ListItem,
	PhrasingContent,
} from "mdast";
import { useEffect, useState } from "react";

import { HEADER_HEIGHT } from "@/app/layout";
import { NextLink } from "@/components/Link/NextLink";
import _ from "lodash";
import type { Result } from "mdast-util-toc";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

const RenderPhrasingContent = ({
	content,
	activeId,
}: { content: PhrasingContent; activeId: string }) => {
	if (content.type === "link") {
		return (
			<NextLink
				href={content.url}
				className={`${activeId === content.url.replace("#", "") ? "is-active" : ""} ${css(
					{
						textWrap: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					},
				)}`}
			>
				{content.children.map((c, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<RenderPhrasingContent key={i} content={c} activeId={activeId} />
				))}
			</NextLink>
		);
	}

	if (content.type === "text") {
		return <>{content.value}</>;
	}

	return null;
};

const RenderBlockContent = ({
	content,
	activeId,
}: { content: BlockContent | DefinitionContent; activeId: string }) => {
	if (content.type === "paragraph") {
		return (
			<p>
				{content.children.map((c, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<RenderPhrasingContent key={i} content={c} activeId={activeId} />
				))}
			</p>
		);
	}

	if (content.type === "list") {
		return <RecursiveList list={content} activeId={activeId} />;
	}

	return null;
};

export const RecursiveListItem = ({
	listItem,
	activeId,
}: { listItem: ListItem; activeId: string }) => {
	return (
		<>
			{listItem.children.length
				? listItem.children.map((item, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<RenderBlockContent key={i} content={item} activeId={activeId} />
					))
				: null}
		</>
	);
};

export const RecursiveList = ({
	list,
	activeId,
}: { list: List; activeId: string }) => {
	return (
		<ul>
			{list.children.map((c, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<RecursiveListItem listItem={c} key={i} activeId={activeId} />
			))}
		</ul>
	);
};

export const embedMarkdownClass = "embed-markdown";

export const SideTableOfContents = ({
	toc,
}: { toc: Exclude<Result["map"], undefined> }) => {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = _.throttle(() => {
			// const embedMarkdownClass = "embed-markdown";
			const hTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
			const headings = Array.from(
				document.querySelectorAll(hTags.join(", ")),
			).filter((heading) => {
				return !heading.closest(`.${embedMarkdownClass}`);
			});
			const scrollPosition = window.scrollY;

			for (let i = headings.length - 1; i >= 0; i--) {
				const heading = headings[i] as HTMLElement;
				if (heading.offsetTop <= scrollPosition + 10) {
					setActiveId(heading.id);
					break;
				}
			}
		}, 250);

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<Stack
			w={1280 - 1000 - 10}
			display={{
				// 1280px
				xl: "flex",
				base: "none",
			}}
			bg="white"
			rounded={"md"}
			style={{
				top: `calc(${HEADER_HEIGHT} + 8px)`,
				maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 8px)`,
			}}
			position={"sticky"}
			overflowX={"hidden"}
			overflowY={"auto"}
			className={css({
				fontSize: "0.8em",
				px: 2,
				"& ul": {
					py: 0,
					pl: 3,
				},
				"& > ul": {
					pl: 0,
				},
				"& p": {
					m: 0,
				},
				"& a": {
					textDecoration: "none",
					display: "block",
					rounded: "md",
					color: "gray.11",
					px: 2,
					py: 1,
					"&:hover": {
						bg: "gray.4",
					},
					"&.is-active": {
						color: "gray.12",
						fontWeight: "bold",
					},
				},
			})}
		>
			<RecursiveList list={toc} activeId={activeId ?? ""} />
		</Stack>
	);
};
