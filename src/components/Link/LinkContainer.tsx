import { css } from "styled-system/css";

import {
	EmbedLinkImage,
	EmbedLinkPdf,
	EmbedLinkVideo,
	type MDLinkPresentationalType,
	TransitionLinkDead,
	TransitionLinkExist,
} from "./LinkPresentational";
import type { WikiLinkData } from "@/types/mdast";
import { Suspense, type FC } from "react";
import { toNoteHref } from "@/features/metadata/constant";
import { Spinner } from "@/park-ui/components/spinner";
import { EmbedLinkMarkdown, EmbedLinkMarkdownLayout } from "./EmbedMarkdown";
import { ErrorBoundary } from "react-error-boundary";
import { FileWarningIcon } from "lucide-react";

export type WikiLinkComponentProps = WikiLinkData["hProperties"];

export const LinkContainer: FC<WikiLinkComponentProps> = (props) => {
	const { href, "is-embed": isEmbed, alias, ...others } = props;

	if (isEmbed) {
		return <EmbedLinkContainer {...props} />;
	}

	const { parentsLinks, assetsDirPath, ...linkProps } = props;

	return <TransitionLinkContainer {...linkProps} />;
};

export const TransitionLinkContainer: FC<MDLinkPresentationalType> = ({
	isDeadLink,
	...props
}) => {
	if (isDeadLink === "true") {
		return <TransitionLinkDead {...props} />;
	}

	return <TransitionLinkExist {...props} />;
};

export const EmbedLinkContainer: FC<WikiLinkComponentProps> = ({
	assetsDirPath,
	parentsLinks,
	isDeadLink,
	type,
	...props
}) => {
	const { href, title, alias, ...others } = props;

	const withNoteHref = toNoteHref(href);

	if (type === "img") {
		return <EmbedLinkImage {...props} href={withNoteHref} />;
	}

	if (type === "video") {
		return <EmbedLinkVideo {...props} href={withNoteHref} />;
	}

	if (type === "pdf") {
		return <EmbedLinkPdf {...props} href={withNoteHref} />;
	}

	if (type === "link") {
		return (
			<EmbedLinkMarkdownLayout title={alias ?? title} href={href}>
				<ErrorBoundary fallback={<FileWarningIcon />}>
					<Suspense fallback={<Spinner />}>
						<EmbedLinkMarkdown
							{...props}
							href={href}
							parentsLinks={parentsLinks}
						/>
					</Suspense>
				</ErrorBoundary>
			</EmbedLinkMarkdownLayout>
		);
	}

	return (
		<span
			{...others}
			className={css({ bg: "black.a2", px: 2, py: 1, rounded: "md" })}
		>
			{alias ?? `⚠️${title}: を埋め込み表示できません`}
		</span>
	);
};
