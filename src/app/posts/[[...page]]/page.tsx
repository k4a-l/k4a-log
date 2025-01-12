import path from "node:path";
import { FrontMatter } from "@/components/FrontMatter";
import { assetsDirPath } from "@/features/metadata/constant";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { getFileContent as getFileData } from "@/features/remark/processor/getContent";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { createFileTrees } from "@/features/remark/wikilink/util";
import { isSamePath, normalizePath } from "@/utils/path";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";
import { HStack, Spacer, Stack } from "styled-system/jsx";

import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { BackLinks, TwoHopLinks } from "@/components/PostLink";
import { SideTableOfContents } from "@/components/Toc";
import { postDirPath } from "@/constants/path";
import { getVaultObject } from "@/features/file/io";
import {} from "lucide-react";

const directoryPath = path.join(assetsDirPath, postDirPath);

type Params = Promise<{ page: string[] | undefined }>;

type Props = { params: Params };

export default async function Page({ params }: Props) {
	// 生の値取得→postDirはついてない
	const pathsFromParams = (await params).page ?? ["index"];
	const pathFromParams = path.join(...pathsFromParams);

	// metadataの取得
	const vaultObject = await getVaultObject();

	// uid→pathの検索（mapにはpostDirPathが入っている）
	const uidPathMap = Object.fromEntries(
		Object.entries(vaultObject.pathMap).map(([key, value]) => [
			value?.replace(new RegExp(`^${postDirPath}`), ""),
			key?.replace(new RegExp(`^${postDirPath}`), ""),
		]),
	);
	// uidに一致すればそれを使用、しなければそのまま
	const postPath = uidPathMap[normalizePath(pathFromParams)] ?? pathFromParams;

	const tPost = vaultObject.posts.find((p) =>
		isSamePath(p.path, path.join(postDirPath, postPath)),
	);

	// このファイルの事前準備
	const fileTrees = createFileTrees(directoryPath);
	const parseProcessor = createParseProcessor(fileTrees, [postPath]);
	const runProcessor = createRunProcessor();
	const stringifyProcessor = createStringifyProcessor({
		pathMap: vaultObject.pathMap,
	});

	// 実行
	const fileData = await getFileData(
		postPath.split(/\\|\//),
		directoryPath,
		parseProcessor,
		runProcessor,
		stringifyProcessor,
	);

	// データ加工
	const { frontmatter } = fileData.data;

	const title: string = frontmatter?.title || fileData.title;

	return (
		<PageWithTransition>
			<title>{title}</title>
			<meta property="og:title" content={fileData.title} key="title" />
			<HStack
				justifyContent={"center"}
				alignItems={"start"}
				w="100%"
				className={`${css({
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}, `}
				h="100%"
			>
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
							{title}
						</div>
						{frontmatter ? <FrontMatter frontmatter={frontmatter} /> : null}
						<div className="md-post-container">{fileData.content}</div>
					</Stack>
					<Spacer h={4} />
					{tPost?.backLinks.length ? (
						<Stack
							className={css({
								bg: "white",
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
								p: 2,
								rounded: "md",
								gap: 2,
							})}
						>
							<TwoHopLinks tPost={tPost} />
						</Stack>
					) : null}
				</Stack>
				{fileData.data.toc?.children.length ? (
					<SideTableOfContents toc={fileData.data.toc} />
				) : null}
			</HStack>
		</PageWithTransition>
	);
}
