"use client";

import { FileIcon, Link2Icon } from "lucide-react";

import { NextLink } from "@/components/Link/NextLink";
import { toNoteHref } from "@/features/metadata/constant";
import { Button } from "@/park-ui/components/button";
import { normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import type { TNote } from "@/features/metadata/type";

export const BackLinks = ({ tNote }: { tNote: TNote }) => {
	return (
		<>
			<p
				className={css({
					fontSize: "0.8em",
					fontWeight: "bold",
					lineHeight: 0,
					px: 2,
				})}
			>
				関連
			</p>
			<Stack gap={0}>
				{tNote?.backLinks.map((bl) => (
					<Button
						asChild
						fontWeight={"normal"}
						height={"auto"}
						justifyContent={"start"}
						key={bl.path}
						p={{ md: 2, base: 1 }}
						rounded={"sm"}
						size={{ md: "md", base: "sm" }}
						textDecoration={"none"}
						textWrap={"wrap"}
						variant={"ghost"}
					>
						<NextLink href={toNoteHref(normalizePath(bl.path))}>
							<FileIcon className={css({ flexShrink: 0 })} />
							{bl.title}
						</NextLink>
					</Button>
				))}
			</Stack>
		</>
	);
};

export const TwoHopLinks = ({ tNote }: { tNote: TNote }) => {
	return (
		<>
			{tNote?.twoHopLinks.map((thl) => (
				<Stack gap={0} key={thl.path}>
					<Button
						asChild
						disabled={!thl.isExists}
						fontWeight={"normal"}
						height={"auto"}
						justifyContent={"start"}
						key={thl.path}
						p={{ md: 2, base: 1 }}
						rounded={"sm"}
						size={{ md: "md", base: "sm" }}
						textDecoration={"none"}
						textWrap={"wrap"}
						variant={"ghost"}
					>
						<NextLink
							href={
								thl.isExists ? toNoteHref(normalizePath(thl.path)) : undefined
							}
						>
							<FileIcon className={css({ flexShrink: 0 })} />
							{thl.title}
						</NextLink>
					</Button>
					{thl.links.map((l) => (
						<Button
							asChild
							fontWeight={"normal"}
							height={"auto"}
							justifyContent={"start"}
							key={l.path}
							ml={"2em"}
							p={{ md: 2, base: 1 }}
							rounded={"sm"}
							size={{ md: "md", base: "sm" }}
							textDecoration={"none"}
							textWrap={"wrap"}
							variant={"ghost"}
						>
							<NextLink href={toNoteHref(normalizePath(l.path))}>
								<Link2Icon className={css({ flexShrink: 0 })} />
								{l.title}
							</NextLink>
						</Button>
					))}
				</Stack>
			))}
		</>
	);
};
