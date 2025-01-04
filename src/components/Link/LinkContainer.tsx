import type { WikiLinkData } from "@/types/mdast";
import type { AnchorHTMLAttributes, FC } from "react";
import { EmbedLinkPresentation, LinkPresentation } from "./LinkPrentational";

export const LinkContainer: FC<
	AnchorHTMLAttributes<HTMLAnchorElement> & WikiLinkData["hProperties"]
> = (props) => {
	const { href, children, "is-embed": isEmbed, ...others } = props;

	if (isEmbed) {
		return <EmbedLinkPresentation {...props} />;
	}

	return <LinkPresentation {...props} />;
};
