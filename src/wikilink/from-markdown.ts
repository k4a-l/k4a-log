import type {
	CompileContext,
	Extension as FromMarkdownExtension,
	Token,
} from "mdast-util-from-markdown";
import { HtmlProps } from "next/dist/shared/lib/html-context.shared-runtime";
import type { HTMLProps } from "react";
import type { Opt } from ".";

function wikiLinkTransclusionFormat(
	extension: string | undefined,
): [boolean, string] {
	const transclusionFormats = [
		/\.jpe?g$/,
		/\.a?png$/,
		/\.webp$/,
		/\.avif$/,
		/\.gif$/,
		/\.svg$/,
		/\.bmp$/,
		/\.ico$/,
		/\.pdf$/,
	];

	if (!extension) return [false, ""];

	const supportedFormat = extension.match(
		transclusionFormats.filter((r) => extension.match(r))[0],
	)?.[0];
	const strippedExtension = extension.match(/\.[0-9a-z]{1,4}$/gi);

	if (!supportedFormat)
		return [false, strippedExtension?.[0].replace(".", "") ?? ""];

	return [true, supportedFormat.replace(".", "")];
}

type WikiLink = {
	data: {
		alias: string;
		hName: string;
		hChildren: { type: string; value: string }[];
		permalink: string;
		exists: boolean;
		hProperties: HTMLProps<""> & { className: string };
	};
	value: string;
};

function fromMarkdown(opts: Opt): FromMarkdownExtension {
	const permalinks = opts.permalinks || [];
	const defaultPageResolver = (name: string) => [name.replace(/ /g, "-")];
	const pageResolver = opts.pageResolver || defaultPageResolver;
	const newClassName = opts.newClassName || "new";
	const wikiLinkClassName = opts.wikiLinkClassName || "internal";
	const defaultHrefTemplate = (permalink: string) => {
		if (permalink.startsWith("#")) return permalink;
		return `/${permalink}`;
	};
	const hrefTemplate = opts.hrefTemplate || defaultHrefTemplate;

	function enterWikiLink(this: CompileContext, token: Token) {
		this.enter(
			{
				type: "wikiLink",
				isType: token.isType ? token.isType : null,
				value: "",
				data: {
					alias: null,
					permalink: null,
					exists: null,
				},
			},
			token,
		);
	}

	function top(stack: string[]) {
		return stack[stack.length - 1];
	}

	function exitWikiLinkAlias(this: CompileContext, token: Token) {
		const alias = this.sliceSerialize(token);
		const current = top(this.stack);
		current.data.alias = alias;
	}

	function exitWikiLinkTarget(this: CompileContext, token: Token) {
		const target = this.sliceSerialize(token);
		const current = top(this.stack);
		current.value = target;
	}

	function exitWikiLink(this: CompileContext, token: Token) {
		// return;
		this.exit(token);

		const wikiLink: WikiLink = this.stack.slice(-1)[0]?.children?.slice(-1)[0];
		const wikiLinkTransclusion = token.isType === "transclusions";

		const pagePermalinks = pageResolver(wikiLink.value);
		let permalink = pagePermalinks.find((p) => {
			let heading = "";

			if (!wikiLinkTransclusion && p.match(/#/)) {
				[, heading] = p.split("#");
			}
			const link = heading ? p.replace(`#${heading}`, "") : p;
			return permalinks.indexOf(link) !== -1;
		});
		const exists = permalink !== undefined;
		const regex = /\/?index(?![\w\S])|\/?index(?=#)/g;
		if (permalink === undefined) {
			permalink = pagePermalinks[0];
		}
		if (!wikiLinkTransclusion && permalink.match(regex)) {
			permalink = permalink.replace(regex, "");
		}

		let displayName: string;
		let transclusionFormat: [boolean, string] = [false, ""];

		if (wikiLinkTransclusion) {
			transclusionFormat = wikiLinkTransclusionFormat(wikiLink.value);
			if (!transclusionFormat[0]) {
				displayName = `Document type ${transclusionFormat[1] ? transclusionFormat[1].toUpperCase() : null} is not yet supported for transclusion`;
				console.warn(displayName);
				wikiLink.data.hName = "span";
				wikiLink.data.hChildren = [
					{
						type: "text",
						value: displayName,
					},
				];
			} else {
				const regex = new RegExp(`${transclusionFormat[1]}$`, "g");
				displayName = wikiLink.value.replace(regex, "");

				if (transclusionFormat[1] === "pdf") {
					wikiLink.data.hName = "embed";
				} else {
					wikiLink.data.hName = "img";
				}
			}
		} else {
			if (wikiLink.value.startsWith("#")) {
				displayName = wikiLink.value.replace("#", "");
			} else {
				displayName = wikiLink.value;
			}
			wikiLink.data.hName = "a";
		}

		if (wikiLink.data.alias && !wikiLinkTransclusion) {
			displayName = wikiLink.data.alias;
		}

		let classNames = wikiLinkClassName;
		if (!exists) {
			classNames += ` ${newClassName}`;
		}

		wikiLink.data.alias = displayName;

		if (wikiLinkTransclusion && transclusionFormat[1] === "pdf") {
			wikiLink.data.permalink = `${permalink}#view=Fit`;
		} else {
			wikiLink.data.permalink = permalink;
		}
		wikiLink.data.exists = exists;

		if (wikiLinkTransclusion) {
			if (!transclusionFormat[0]) {
				wikiLink.data.hProperties = {
					className: `${classNames} no-support`,
					style: "color:#fef08a;",
					src: hrefTemplate(permalink),
				};
			} else if (transclusionFormat[1] === "pdf") {
				wikiLink.data.hProperties = {
					className: classNames,
					width: "100%",
					style: "height:100vh;",
					type: "application/pdf",
					src: `${hrefTemplate(permalink)}#view=Fit`,
				};
			} else {
				wikiLink.data.hProperties = {
					className: classNames,
					src: hrefTemplate(permalink),
				};
			}
		} else {
			wikiLink.data.hProperties = {
				className: classNames,
				href: hrefTemplate(permalink),
			};
			wikiLink.data.hChildren = [
				{
					type: "text",
					value: displayName,
				},
			];
		}
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

export { fromMarkdown, wikiLinkTransclusionFormat };
