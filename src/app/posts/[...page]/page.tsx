import { readFile } from "node:fs/promises";
import path from "node:path";
import { FrontMatter } from "@/components/FrontMatter";
import {
	assetsDirPath,
	vaultMetadataFilePath,
} from "@/features/metadata/constant";
import type { TPost } from "@/features/metadata/type";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { getFileContent as getFileData } from "@/features/remark/wikilink/file";
import { createFileTrees } from "@/features/remark/wikilink/util";
import { isSamePath } from "@/utils/path";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";
import { Center, Spacer, Stack } from "styled-system/jsx";

import { Button } from "@/park-ui/components/button";
import { FileIcon, Link2Icon } from "lucide-react";
import NextLink from "next/link";

const directoryPath = path.join(assetsDirPath, "/posts");

type Params = Promise<{ page: string[] }>;

export default async function Home({ params }: { params: Params }) {
	const paths = (await params).page;

	const fileTrees = createFileTrees(directoryPath);

	// 事前準備
	const parseProcessor = createParseProcessor(fileTrees, [path.join(...paths)]);
	const runProcessor = createRunProcessor();
	const stringifyProcessor = createStringifyProcessor();

	// 実行
	const fileData = await getFileData(
		paths,
		directoryPath,
		parseProcessor,
		runProcessor,
		stringifyProcessor,
	);

	// データ加工
	const { frontMatter } = fileData.data;

	const vaultFileContent = await readFile(vaultMetadataFilePath, {
		encoding: "utf-8",
	});
	// TODO: エラーハンドリンク
	const vaultObject: TPost[] = JSON.parse(vaultFileContent);
	const tPost = vaultObject.find((p) =>
		isSamePath(p.path, path.join("/posts", ...paths)),
	);

	return (
		<>
			<title>{fileData.title}</title>
			<meta property="og:title" content={fileData.title} key="title" />
			<Center
				className={css({
					px: { md: 10, base: 2 },
					py: 4,
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}
			>
				<Stack maxW={"max(1000px,100%)"} w={"1000px"}>
					<div
						className={css({
							fontSize: "1.5em",
							fontWeight: "bold",
							borderBottomWidth: "6",
							borderBottomColor: "gray.3",
						})}
					>
						{fileData.title}
					</div>
					{frontMatter ? <FrontMatter frontmatter={frontMatter} /> : null}
					<div>{fileData.content}</div>
					<Spacer h={4} />
					{tPost?.backLinks.length ? (
						<Stack
							className={css({
								bg: "whitesmoke",
								borderWidth: 1,
								py: 2,
								px: 2,
								rounded: "md",
								gap: 2,
							})}
						>
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
							<Stack
								className={css({
									gap: 0,
								})}
							>
								{tPost?.backLinks.map((bl) => (
									<Button
										asChild
										key={bl.path}
										variant={"ghost"}
										size={{ md: "md", base: "sm" }}
										fontWeight={"normal"}
										justifyContent={"start"}
										rounded={"sm"}
										height={"auto"}
										p={{ md: 2, base: 1 }}
										textDecoration={"none"}
									>
										<NextLink href={path.join("/", bl.path)}>
											<FileIcon />
											{bl.title}
										</NextLink>
									</Button>
								))}
							</Stack>
						</Stack>
					) : null}

					{tPost?.twoHopLinks.length ? (
						<Stack
							className={css({
								bg: "whitesmoke",
								borderWidth: 1,
								py: 2,
								px: 2,
								rounded: "md",
								gap: 2,
							})}
						>
							{tPost?.twoHopLinks.map((thl) => (
								<Stack
									key={thl.path}
									className={css({
										gap: 0,
									})}
								>
									<Button
										asChild
										key={thl.path}
										variant={"ghost"}
										size={{ md: "md", base: "sm" }}
										justifyContent={"start"}
										rounded={"sm"}
										height={"auto"}
										p={{ md: 2, base: 1 }}
										textDecoration={"none"}
									>
										<NextLink href={path.join("/", thl.path)}>
											<FileIcon />
											{thl.title}
										</NextLink>
									</Button>
									{thl.links.map((l) => (
										<Button
											asChild
											key={l.path}
											variant={"ghost"}
											size={{ md: "md", base: "sm" }}
											fontWeight={"normal"}
											justifyContent={"start"}
											rounded={"sm"}
											height={"auto"}
											p={{ md: 2, base: 1 }}
											ml={"2em"}
											textDecoration={"none"}
										>
											<NextLink href={path.join("/", l.path)}>
												<Link2Icon />
												{l.title}
											</NextLink>
										</Button>
									))}
								</Stack>
							))}
						</Stack>
					) : null}
				</Stack>
			</Center>
		</>
	);
}
