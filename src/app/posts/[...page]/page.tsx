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
import { getFileContent as getFileData } from "@/features/remark/processor/getContent";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { createFileTrees } from "@/features/remark/wikilink/util";
import { isSamePath } from "@/utils/path";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";
import { Center, HStack, Spacer, Stack } from "styled-system/jsx";

import { BackLinks, TwoHopLinks } from "@/components/PostLink";
import { SideTableOfContents } from "@/components/Toc";
import {} from "lucide-react";

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
	const { frontmatter } = fileData.data;

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
				className={`${css({
					px: { md: 10, base: 2 },
					py: 4,
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}, `}
				bg="blue.2"
			>
				<HStack alignItems={"start"} pb={100} w="100%">
					<Stack maxW={"max(1000px,100%)"} w={"1000px"}>
						<Stack bg="white" p={4} rounded={"md"}>
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
							{frontmatter ? <FrontMatter frontmatter={frontmatter} /> : null}
							<div className="md-post-container">{fileData.content}</div>
						</Stack>
						<Spacer h={4} />
						{tPost?.backLinks.length ? (
							<Stack
								className={css({
									bg: "white",
									// borderWidth: 1,
									p: 2,
									rounded: "md",
									gap: 2,
								})}
							>
								<BackLinks tPost={tPost} />
							</Stack>
						) : null}
						{tPost?.twoHopLinks.length ? (
							<Stack
								className={css({
									bg: "white",
									// borderWidth: 1,
									p: 2,
									rounded: "md",
									gap: 2,
								})}
							>
								<TwoHopLinks tPost={tPost} />
							</Stack>
						) : null}
					</Stack>
					{fileData.data.toc ? (
						<SideTableOfContents toc={fileData.data.toc} />
					) : null}
				</HStack>
			</Center>
		</>
	);
}
