import path from "node:path";
import type { WikiLink, WikiLinkData } from "@/types/mdast";
import type {
	CompileContext,
	Extension as FromMarkdownExtension,
	Token,
} from "mdast-util-from-markdown";
import type { WikiLinkContentMap, WikiLinkOption } from "./type";
import { getWikiLinkExtension, lastOfArr, pathResolver } from "./util";

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
		if (!("children" in stack)) return;
		const child = lastOfArr(stack?.children);
		if (child.type !== "wikiLink") return;

		const wikiLink = child as WikiLinkContentMap;

		wikiLink.data = createWikiLinkData(token, wikiLink.value, wikiLink, opts);
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
	pathValue: string,
	wikiLink: WikiLinkContentMap,
	opts: Required<WikiLinkOption>,
): WikiLinkData => {
	const defaultHrefTemplate = (permalink: string) => {
		if (permalink.startsWith("#")) return permalink;
		return `/${permalink}`;
	};
	const hrefTemplate = defaultHrefTemplate;

	const isEmbed = Boolean(token.embed);
	const _link = pathResolver({
		linkName: pathValue,
		currentPathList: opts.currentPaths,
		fileTrees: opts.fileTrees,
	});
	const link = _link
		? wikiLink.value.startsWith("#")
			? _link
			: path.join(opts.rootPath, _link)
		: undefined;

	const extensionInfo = getWikiLinkExtension(wikiLink.value);
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

	const type: WikiLinkData["type"] = extensionInfo.type;
	const hName = "a";
	const hChildren: WikiLinkData["hChildren"] = [
		{ type: "text", value: displayName },
	];
	const hProperties: WikiLinkData["hProperties"] = {
		className: classNames,
		href: link ? hrefTemplate(link) : "",
		title: displayName,
		alias: wikiLink.data?.alias,
		type,
		"is-embed": isEmbed ? "true" : undefined,
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
	};
};
