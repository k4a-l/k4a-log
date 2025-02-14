// ref: https://github.com/escwxyz/remark-obsidian-callout

import type {} from "unist";
import { visit } from "unist-util-visit";

import {
	alertTriangleIcon,
	bugIcon,
	chatIcon,
	checkCircleIcon,
	checkIcon,
	clipboardListIcon,
	expandIcon,
	flameIcon,
	helpCircleIcon,
	infoIcon,
	listIcon,
	pencilIcon,
	quoteIcon,
	xIcon,
	zapIcon,
} from "./icons";

import type {
	BlockContent,
	DefinitionContent,
	PhrasingContent,
	Root,
} from "mdast";
import type { Plugin } from "unified";

type Callout = Record<string, unknown>;

/**
 * Plugin configuration
 */
export interface Config {
	/**
	 * the data attribute name to be added to the blockquote
	 */
	dataAttribute: string;
	/**
	 * the custom class name to be added to the blockquote, by default it's `${dataAttribute}-${calloutType}` if not specified
	 */
	blockquoteClass: string | undefined;
	/**
	 * the custom class name to be added to the div, the parent element of icon & title text
	 */
	titleClass: string;
	/**
	 * the tag name for the title text element, default to `div`
	 */
	titleTextTagName: string;
	/**
	 * the custom class name to be added to the title text element
	 */
	titleInnerClass: string;
	/**
	 * a function to transform the title text, you can use it to append custom strings
	 */
	titleTextTransform: (title: string) => string;
	/**
	 * the tag name for the title icon element, default to `div`
	 */
	iconTagName: string;
	/**
	 * the custom class name to be added to the title icon element
	 */
	iconClass: string;
	/**
	 * the custom class name to be added to the content element

	 */
	contentClass: string;
	/**
	 * predefined callouts, an object with callout's name as key, its SVG icon as value,
	 *
	 * see https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types,
	 *
	 * you can customize it by overriding the same callout's icon or passing new callout with customized name and icon
	 */
	callouts: Record<string, string>;
}

/**
 * Default configuration
 */
const defaultConfig: Config = {
	dataAttribute: "callout",
	blockquoteClass: undefined,
	titleClass: "callout-title",
	titleTextTagName: "div",
	titleInnerClass: "callout-title-inner",
	titleTextTransform: (title: string) => title.trim(),
	iconTagName: "div",
	iconClass: "callout-title-icon",
	contentClass: "callout-content",
	callouts: {
		note: pencilIcon,
		abstract: clipboardListIcon,
		summary: clipboardListIcon,
		tldr: clipboardListIcon,
		info: infoIcon,
		todo: checkCircleIcon,
		tip: flameIcon,
		hint: flameIcon,
		important: flameIcon,
		success: checkIcon,
		check: checkIcon,
		done: checkIcon,
		question: helpCircleIcon,
		help: helpCircleIcon,
		faq: helpCircleIcon,
		warning: alertTriangleIcon,
		attention: alertTriangleIcon,
		caution: alertTriangleIcon,
		failure: xIcon,
		missing: xIcon,
		fail: xIcon,
		danger: zapIcon,
		error: zapIcon,
		bug: bugIcon,
		example: listIcon,
		quote: quoteIcon,
		cite: quoteIcon,
		chat1: chatIcon,
		chat2: chatIcon,
	},
};

const REGEX = /^\[\!(.+)\]([+-]?)/;

/**
 * Check if the str is a valid callout type
 */
const memoizedContainsKey = memoize((obj: Callout, str: string) =>
	Object.keys(obj).includes(str.toLowerCase()),
);

function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
	fn: T,
): T {
	const cache = new Map();
	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}
/**
 * This is a remark plugin that parses Obsidian's callout syntax, and adds custom data attributes and classes to the HTML elements for further customizations.
 */
const RemarkCalloutPlugin: Plugin = (
	customConfig?: Partial<Config>,
): ((tree: Root) => void) => {
	const mergedConfig = {
		...defaultConfig,
		...customConfig,
		callouts: {
			...defaultConfig.callouts,
			...customConfig?.callouts,
		},
	};

	const {
		dataAttribute,
		blockquoteClass,
		titleClass,
		iconTagName,
		iconClass,
		contentClass,
		callouts,
		titleInnerClass: titleTextClass,
		titleTextTagName,
		titleTextTransform,
	} = mergedConfig;

	return (tree: Root): void => {
		visit(tree, "blockquote", (node) => {
			if (!("children" in node) || node.children.length === 0) return;
			const [firstChild, ...otherChildren] = node.children;

			if (!firstChild) return;
			if (firstChild.type !== "paragraph") return;

			const [firstLine, ...remainingLines] = firstChild.children;
			if (!firstLine) return;

			if (firstLine.type !== "text") return;
			const matched = firstLine.value.match(REGEX);

			if (matched) {
				node.children = [];

				const array = REGEX.exec(firstLine.value);

				const calloutType = array?.at(1);
				const expandCollapseSign = array?.at(2);
				const dataExpandable = Boolean(expandCollapseSign);
				const dataExpanded = expandCollapseSign === "+";

				if (array && calloutType) {
					let icon: string;
					let validCalloutType: string;

					// break要素が出現する前の要素
					const breakElIndex = remainingLines.findIndex(
						(line) => line.type === "break",
					);
					const titleChildren = remainingLines.slice(
						0,
						breakElIndex === -1 ? 0 : breakElIndex,
					);
					const contentChildren = remainingLines.slice(
						breakElIndex === -1 ? 0 : breakElIndex + 1,
					);

					if (memoizedContainsKey(callouts, calloutType)) {
						icon = callouts[calloutType.toLowerCase()] ?? pencilIcon;
						validCalloutType = calloutType.toLowerCase();
					} else {
						icon = callouts.note ?? pencilIcon;
						validCalloutType = "note";
					}

					const title =
						array.input.slice(matched[0].length).trim() ||
						calloutType.toUpperCase();

					console.log({
						breakElIndex,
						titleChildren,
						title,
						contentChildren,
						otherChildren,
						remainingLines,
					});

					const iconHTML = `<${iconTagName} class="${iconClass}">${icon}</${iconTagName}>`;

					const titleHtmlNode: BlockContent | DefinitionContent = {
						// @ts-expect-error わからん
						type: "element",
						data: { hProperties: { className: titleClass }, hName: "div" },
						// @ts-expect-error
						children: [
							{
								type: "html",
								value: iconHTML,
							},
							{
								type: "element",
								data: { hProperties: { className: titleTextClass } },
								children: [
									{
										type: "text",
										value: title,
									},
									...titleChildren,
									...(breakElIndex === -1 ? contentChildren : []),
								],
							},
							...((dataExpandable
								? [
										{
											type: "html",
											value: `<${iconTagName} class="${iconClass}">${expandIcon}</${iconTagName}>`,
										},
									]
								: []) satisfies BlockContent[]),
						] as (BlockContent | PhrasingContent)[],
					};

					node.children.splice(0, 1, titleHtmlNode);

					node.data = {
						...node.data,
						hProperties: {
							...(node.data?.hProperties || {}),
							className:
								blockquoteClass || `${dataAttribute}-${validCalloutType}`,
							[`data-${dataAttribute}`]: validCalloutType,
							"data-expandable": String(dataExpandable),
							"data-expanded": String(dataExpanded),
						},
					};

					if (breakElIndex !== -1) {
						node.children.push({
							type: "paragraph",
							data: {
								hProperties: { className: contentClass },
								hName: "div",
							},
							children: [
								...contentChildren,
								// これ以降はデフォルトの動作に任せる
								...(otherChildren.length
									? ([{ type: "break" }] as PhrasingContent[])
									: ([] as PhrasingContent[])),
								...(otherChildren as PhrasingContent[]),
							],
						});
					}
				}
			}
		});
	};
};

export default RemarkCalloutPlugin;
