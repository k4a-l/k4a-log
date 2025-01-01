// https://github.com/datopian/remark-wiki-link-plus/blob/main/src/syntax.js

import type {
	Extension as MicromarkExtension,
	State,
	Tokenizer,
} from "micromark-util-types";
import type { Opt } from ".";

type Code = {
	horizontalTab: number;
	virtualSpace: number;
	nul: number;
	eof: null;
	space: number;
};

const codes: Code = {
	horizontalTab: -2,
	virtualSpace: -1,
	nul: 0,
	eof: null,
	space: 32,
};

function markdownLineEndingOrSpace(code: number) {
	return code < codes.nul || code === codes.space;
}

function markdownLineEnding(code: number) {
	return code < codes.horizontalTab;
}

function wikiLink(opts: Opt = {}): MicromarkExtension {
	const aliasDivider = opts.aliasDivider || ":";

	const aliasMarker = aliasDivider;
	const startMarker = "[[";
	const imageStartMarker = "![[";
	const endMarker = "]]";

	const tokenize: Tokenizer = function tokenize(this, effects, ok, nok): State {
		let data: string | boolean;
		let alias: string | boolean;

		let aliasCursor = 0;
		let startMarkerCursor = 0;
		let endMarkerCursor = 0;

		return start;

		function start(code: number): State {
			if (code === startMarker.charCodeAt(startMarkerCursor)) {
				effects.enter("wikiLink");
				effects.enter("wikiLinkMarker");

				return consumeStart(code);
			}
			if (code === imageStartMarker.charCodeAt(startMarkerCursor)) {
				effects.enter("wikiLink", { isType: "transclusions" });
				effects.enter("wikiLinkMarker", { isType: "transclusions" });

				return consumeStart(code);
			}

			return nok(code);
		}

		function consumeStart(code: number) {
			if (startMarkerCursor === startMarker.length) {
				effects.exit("wikiLinkMarker");
				return consumeData(code);
			}

			if (
				code === startMarker.charCodeAt(startMarkerCursor) ||
				code === imageStartMarker.charCodeAt(startMarkerCursor)
			) {
				effects.consume(code);
				if (code === 91) startMarkerCursor++;

				return consumeStart;
			}

			return nok(code);
		}

		function consumeData(code: number) {
			if (markdownLineEnding(code) || code === codes.eof) {
				return nok(code);
			}

			effects.enter("wikiLinkData");
			effects.enter("wikiLinkTarget");
			return consumeTarget(code);
		}

		function consumeTarget(code: number) {
			if (code === aliasMarker.charCodeAt(aliasCursor)) {
				if (!data) return nok(code);
				effects.exit("wikiLinkTarget");
				effects.enter("wikiLinkAliasMarker");
				return consumeAliasMarker(code);
			}

			if (code === endMarker.charCodeAt(endMarkerCursor)) {
				if (!data) return nok(code);
				effects.exit("wikiLinkTarget");
				effects.exit("wikiLinkData");
				effects.enter("wikiLinkMarker");
				return consumeEnd(code);
			}

			if (markdownLineEnding(code) || code === codes.eof) {
				return nok(code);
			}

			if (!markdownLineEndingOrSpace(code)) {
				data = true;
			}

			effects.consume(code);

			return consumeTarget;
		}

		function consumeAliasMarker(code: number) {
			if (aliasCursor === aliasMarker.length) {
				effects.exit("wikiLinkAliasMarker");
				effects.enter("wikiLinkAlias");
				return consumeAlias(code);
			}

			if (code !== aliasMarker.charCodeAt(aliasCursor)) {
				return nok(code);
			}

			effects.consume(code);
			aliasCursor++;

			return consumeAliasMarker;
		}

		function consumeAlias(code: number) {
			if (code === endMarker.charCodeAt(endMarkerCursor)) {
				if (!alias) return nok(code);
				effects.exit("wikiLinkAlias");
				effects.exit("wikiLinkData");
				effects.enter("wikiLinkMarker");
				return consumeEnd(code);
			}

			if (markdownLineEnding(code) || code === codes.eof) {
				return nok(code);
			}

			if (!markdownLineEndingOrSpace(code)) {
				alias = true;
			}

			effects.consume(code);

			return consumeAlias;
		}

		function consumeEnd(code: number) {
			if (endMarkerCursor === endMarker.length) {
				effects.exit("wikiLinkMarker");
				effects.exit("wikiLink");
				return ok(code);
			}

			if (code !== endMarker.charCodeAt(endMarkerCursor)) {
				return nok(code);
			}

			effects.consume(code);
			endMarkerCursor++;

			return consumeEnd;
		}
	};

	return {
		text: { 91: { tokenize }, 33: { tokenize } }, // 91: left square bracket, 33: exclamation mark
	};
}

export { wikiLink as syntax };
