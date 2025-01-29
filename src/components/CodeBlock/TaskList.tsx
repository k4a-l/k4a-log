import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import type { MetaProps } from "@/features/metadata/type";
import { Link } from "@/park-ui/components/link";
import { normalizePath } from "@/utils/path";
import path from "path-browserify";
import type { PropsWithChildren } from "react";
import { HStack, Stack } from "styled-system/jsx";

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
								size="sm"
								fontSize={"inherit"}
								height="auto"
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={i}
								color={"inherit"}
								href={path.join("/", normalizePath(p.path), `#${t.id}`)}
								variant={"ghost"}
								justifyContent={"start"}
								borderRadius={"none"}
								fontWeight={"normal"}
								textDecoration={"none"}
							>
								<HStack gap={2}>
									<input type="checkbox" checked={t.task === "x"} readOnly />{" "}
									{t.text}
								</HStack>
							</NextLinkButton>
						))}
					</Stack>
				))}
		</Stack>
	);
};
