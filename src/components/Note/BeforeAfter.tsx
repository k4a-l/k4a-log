import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import path from "path-browserify";

import { NextLink } from "@/components/Link/NextLink";
import { blogDirPath } from "@/features/metadata/constant";
import { sortByCreatedNew } from "@/features/note/util";
import { Link } from "@/park-ui/components/link";
import { isSamePath, normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import type { TNote, TVault } from "@/features/metadata/type";

export const BeforeAfterNote = ({
	note,
	vault,
}: { note: TNote; vault: TVault }) => {
	const noteSorted = vault.notes
		.filter((n) => n.path.startsWith(normalizePath(path.join(blogDirPath))))
		.sort((a, b) =>
			sortByCreatedNew(
				{ created: a.metadata.frontmatter?.created },
				{ created: b.metadata.frontmatter?.created },
			),
		);

	const targetNoteIndex = noteSorted.findIndex((n) =>
		isSamePath(n.path, note.path),
	);

	const beforeNote = noteSorted[targetNoteIndex - 1];
	const afterNote = noteSorted[targetNoteIndex + 1];

	return (
		<Stack flexWrap={"wrap"}>
			{beforeNote ? (
				<Link
					asChild
					display={"inline-flex"}
					justifyContent={"start"}
					maxW={"full"}
				>
					<NextLink href={beforeNote.path}>
						<ChevronLeftIcon />
						<span
							className={css({
								overflow: "hidden",
								textOverflow: "ellipsis",
								textWrap: "nowrap",
							})}
						>
							{beforeNote.metadata.frontmatter?.title ?? beforeNote.basename}
						</span>
					</NextLink>
				</Link>
			) : null}
			{afterNote ? (
				<Link
					asChild
					display={"inline-flex"}
					justifyContent={"end"}
					maxW={"full"}
					textAlign={"end"}
				>
					<NextLink href={afterNote.path}>
						<span
							className={css({
								overflow: "hidden",
								textOverflow: "ellipsis",
								textWrap: "nowrap",
							})}
						>
							{afterNote.metadata.frontmatter?.title ?? afterNote.basename}
						</span>
						<ChevronRightIcon />
					</NextLink>
				</Link>
			) : null}
		</Stack>
	);
};
