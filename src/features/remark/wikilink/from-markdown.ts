import path from "node:path";

import { normalizePath, pathSplit, safeDecodeURIComponent } from "@/utils/path";

import { getWikiLinkExtension, lastOfArr, pathResolver } from "./util";

import type { WikiLinkContentMap, WikiLinkOption } from "./type";
import type { WikiLink, WikiLinkData } from "@/types/mdast";
import type {
	CompileContext,
	Extension as FromMarkdownExtension,
	Token,
} from "mdast-util-from-markdown";

export function fromMarkdown(
	opts: Required<WikiLinkOption>,
): FromMarkdownExtension {
	function enterWikiLink(this: CompileContext, token: Token) {
		this.enter({ type: "wikiLink", embed: token.embed, value: "" }, token);
	}

	function exitWikiLinkAlias(this: CompileContext, token: Token) {
		const displayName = this.sliceSerialize(token);
		const current = lastOfArr(this.stack);
		if (!current) return;
		current.data = { ...current.data, alias: displayName } as WikiLink["data"];
	}

	function exitWikiLinkTarget(this: CompileContext, token: Token) {
		const target = this.sliceSerialize(token);
		const current = lastOfArr(this.stack);
		if (!current) return;
		if (current.type !== "wikiLink") return;
		current.value = target;
	}

	function exitWikiLink(this: CompileContext, token: Token) {
		this.exit(token);

		const stack = lastOfArr(this.stack);
		if (!stack) return;
		if (!("children" in stack)) return;
		const child = lastOfArr(stack?.children);
		if (child?.type !== "wikiLink") return;

		const wikiLink = child as WikiLinkContentMap;

		// TagLinkの判定
		const before =
			stack.children.length >= 2 ? stack.children.slice(-2)[0] : undefined;
		let isTagLink = false;
		if (before?.type === "text") {
			if (before.value === "#") {
				stack.children.splice(-2, 1);
				isTagLink = true;
			} else if (before.value.endsWith("#")) {
				stack.children.splice(-2, 1, {
					...before,
					value: before.value.slice(0, -1),
				});
				isTagLink = true;
			}
		}
		wikiLink.data = {
			...wikiLink.data,
			isTagLink,
		} as WikiLinkContentMap["data"];

		wikiLink.data = {
			...wikiLink.data,
			...createWikiLinkData(token, wikiLink.value, wikiLink, opts),
		};
	}

	return {
		enter: {
			wikiLink: enterWikiLink,
		},
		exit: {
			wikiLinkTarget: exitWikiLinkTarget,
			wikiLinkAlias: exitWikiLinkAlias,
			wikiLink: exitWikiLink,
		},
	};
}

const createWikiLinkData = (
	token: Token,
	_pathValue: string,
	wikiLink: WikiLinkContentMap,
	opts: Required<WikiLinkOption>,
): WikiLinkData => {
	const defaultHrefTemplate = (permalink: string) => {
		if (permalink.startsWith("#")) return permalink;
		return normalizePath(permalink);
	};

	const hrefTemplate = defaultHrefTemplate;
	const pathValue = _pathValue.trim();

	const isEmbed = Boolean(token.embed);
	const isTagLink = Boolean(wikiLink.data?.isTagLink);

	const parentsLinks = opts.parentsLinks.map((p) => safeDecodeURIComponent(p));
	const currentPaths: string[] = pathSplit(lastOfArr(parentsLinks) ?? "");

	// ここスキップすると軽くなる
	const _link = pathResolver({
		linkName: pathValue,
		currentPaths: currentPaths,
		fileNodes: opts.notes,
		fileMap: opts.fileMap,
	});

	const extensionInfo = getWikiLinkExtension(wikiLink.value);

	const link = _link
		? wikiLink.value.startsWith("#")
			? _link
			: path.join(opts.rootPath, _link.replace(".md", ""))
		: pathValue;

	const classNames = `${opts.classNames.wikiLink} ${link === undefined ? `${opts.classNames.deadLink}` : ""}`;

	const displayName: string = (() => {
		if (wikiLink.value.startsWith("#")) {
			return wikiLink.value;
		}

		if (isEmbed) {
			if (extensionInfo.type === "unknown") {
				const warningMessage = `${extensionInfo.extension.toUpperCase()} is not supported for embed`;
				console.warn(warningMessage);
				return warningMessage;
			}
			if (extensionInfo.type === "link") {
				const regex = new RegExp(`${extensionInfo.extension}$`, "g");
				return wikiLink.value.replace(regex, "");
			}
			return wikiLink.value;
		}

		return wikiLink.value;
	})();

	const isCirclerReference = [...parentsLinks].some((p) => {
		return (
			safeDecodeURIComponent(
				_link?.replace(/\.md$/, "").replace(/\\/g, "/") ?? "",
			) === p
		);
	});

	const type: WikiLinkData["type"] = extensionInfo.type;
	const hName = "wikilink";
	const hChildren: WikiLinkData["hChildren"] = [
		{ type: "text", value: displayName },
	];
	const isDeadLink = _link === undefined;

	const hProperties: WikiLinkData["hProperties"] = {
		className: classNames,
		href: isDeadLink ? link : hrefTemplate(link),
		title: displayName,
		rootDirPath: opts.rootPath,
		assetsDirPath: opts.assetPath,
		"is-embed": isCirclerReference ? undefined : isEmbed ? "true" : undefined,
		...(type === "unknown"
			? {
					type: "unknown",
					alias: `⚠️「${displayName}」 を埋め込み表示できません`,
				}
			: isCirclerReference && isEmbed
				? {
						type: "unknown",
						alias: `${displayName}：⚠️循環参照`,
					}
				: { type, alias: wikiLink.data?.alias }),
		parentsLinks: [
			...parentsLinks,
			...(_link ? [_link.replace(/\.md$/, "")] : []),
		]
			.map((p) => encodeURIComponent(p))
			.join(" "),
		isDeadLink: isDeadLink ? "true" : undefined,
		isTagLink: isTagLink ? "true" : undefined,
	};

	return {
		type,
		link: link ?? "",
		exists: link !== undefined,
		alias: `${displayName}`,
		hName,
		isEmbed,
		hProperties,
		hChildren,
		isTagLink,
	};
};
