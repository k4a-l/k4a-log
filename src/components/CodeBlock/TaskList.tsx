import path from "path-browserify";

import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import { normalizePath } from "@/utils/path";
import { Stack } from "styled-system/jsx";

import type { MetaProps } from "@/features/metadata/type";
import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";

type Props = { tag: string[] };

export const ReactViewTaskList = ({
	vault,
}: PropsWithChildren<MetaProps & Props>) => {
	return (
		<Stack>
			{vault.notes
				.filter((p) => p.metadata.listItems.some((l) => l.task))
				.map((p) => ({
					title: p.metadata.frontmatter?.title || p.basename,
					path: p.path,
					tasks: p.metadata.listItems.filter((l) => l.task),
				}))
				.map((p, pi) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<Stack key={pi} p={0}>
						<Link asChild color={"blue.10"}>
							<NextLink href={path.join("/", normalizePath(p.path))}>
								{p.title}({p.tasks.length})
							</NextLink>
						</Link>
						{p.tasks.map((t, i) => (
							<NextLinkButton
								borderRadius={"none"}
								color={"inherit"}
								fontSize={"inherit"}
								fontWeight={"normal"}
								height="auto"
								href={path.join("/", normalizePath(p.path), `#${t.id}`)}
								justifyContent={"start"}
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={i}
								size="sm"
								textDecoration={"none"}
								variant={"ghost"}
							>
								<span
									className={css({
										textWrap: "wrap",
									})}
								>
									<input checked={t.task === "x"} readOnly type="checkbox" />{" "}
									{t.text}
								</span>
							</NextLinkButton>
						))}
					</Stack>
				))}
		</Stack>
	);
};
