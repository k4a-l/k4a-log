import { RootContentMap, Token, TokenTypeMap } from "micromark-util-types";

declare module "micromark-util-types" {
	interface TokenTypeMap {
		wikiLink: "wikiLink";
		wikiLinkMarker: "wikiLinkMarker";
		wikiLinkData: "wikiLinkData";
		wikiLinkTarget: "wikiLinkTarget";
		wikiLinkAliasMarker: "wikiLinkAliasMarker";
		wikiLinkAlias: "wikiLinkAlias";
	}

	interface Token {
		embed: boolean;
	}

	interface RootContentMap {
		wikiLink: WikiLinkContentMap;
	}
}
