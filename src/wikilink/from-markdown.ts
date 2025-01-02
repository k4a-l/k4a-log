import type { WikiLink, WikiLinkData } from "@/types/mdast";
import type {
	CompileContext,
	Extension as FromMarkdownExtension,
	Token,
} from "mdast-util-from-markdown";
import type { WikiLinkContentMap, WikiLinkOption } from "./type";
import { getWikiLinkExtension, lastOfArr, pathResolver } from "./util";

export function fromMarkdown(opts: WikiLinkOption): FromMarkdownExtension {
	function enterWikiLink(this: CompileContext, token: Token) {
		this.enter({ type: "wikiLink", embed: token.embed, value: "" }, token);
	}

	function exitWikiLinkAlias(this: CompileContext, token: Token) {
		const displayName = this.sliceSerialize(token);
		const current = lastOfArr(this.stack);
		if (!current) return;
		current.data = { ...current.data, displayName } as WikiLink["data"];
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
	opts: WikiLinkOption,
): WikiLinkData => {
	const permalinks = opts.permalinks || [];
	const pageResolver =
		opts.pageResolver ||
		((name: string) =>
			pathResolver(name, {
				permalinks: opts.permalinks ?? [],
				markdownFolder: opts.markdownFolder,
			}));
	const newClassName = opts.newClassName || "new";
	const wikiLinkClassName = opts.wikiLinkClassName || "internal";
	const defaultHrefTemplate = (permalink: string) => {
		if (permalink.startsWith("#")) return permalink;
		return `/${permalink}`;
	};
	const hrefTemplate = opts.hrefTemplate || defaultHrefTemplate;

	const isEmbed = Boolean(token.embed);
	const link = pageResolver(pathValue);

	const extensionInfo = getWikiLinkExtension(wikiLink.value);
	const classNames = `${wikiLinkClassName} ${link === undefined ? `${newClassName}` : ""}`;

	const displayName: string = (() => {
		if (wikiLink.data?.displayName) {
			return wikiLink.data.displayName;
		}

		if (wikiLink.value.startsWith("#")) {
			return wikiLink.value;
		}

		if (isEmbed) {
			if (extensionInfo.type === "unknown") {
				const warningMessage = `${extensionInfo.extension.toUpperCase()} is not supported for embed`;
				console.warn(warningMessage);
				return warningMessage;
			}
			const regex = new RegExp(`${extensionInfo.extension}$`, "g");
			return wikiLink.value.replace(regex, "");
		}

		return wikiLink.value;
	})();

	const hName = isEmbed ? "span" : "a";
	const hChildren: WikiLinkData["hChildren"] = [
		{ type: "text", value: displayName },
	];
	const hProperties: WikiLinkData["hProperties"] = isEmbed
		? { className: classNames, src: link ? hrefTemplate(link) : "" }
		: { className: classNames, href: link ? hrefTemplate(link) : "" };

	const type: WikiLinkData["type"] = extensionInfo.type;

	return {
		type,
		link: link ?? "",
		exists: link !== undefined,
		displayName,
		hName,
		isEmbed,
		hProperties,
		hChildren,
	};
};
