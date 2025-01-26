import path from "node:path";
import { BookmarkInnerPart } from "@/components/Bookmark";
import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { FrontMatter } from "@/components/FrontMatter";
import { MyHead } from "@/components/Head";
import { BackLinks, TwoHopLinks } from "@/components/PostLink";
import { SideTableOfContents } from "@/components/Toc";
import { postDirPath } from "@/constants/path";
import { getBookmarkObject, getVaultObject } from "@/features/file/io";
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
import { Client } from "./Client";

export const revalidate = 600; // 10分ごとに再検証する

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

	const postPathAbsolute = path.join(postDirPath, postPath);
	const tPost = vaultObject.posts.find((p) =>
		isSamePath(p.path, postPathAbsolute),
	);

	if (!tPost) return null;

	// このファイルの事前準備
	const fileTrees = createFileTrees(directoryPath);
	const parseProcessor = createParseProcessor(fileTrees, [postPath]);
	const runProcessor = createRunProcessor({
		listItems: tPost.metadata.listItems,
	});
	const stringifyProcessor = createStringifyProcessor({
		pathMap: vaultObject.pathMap,
		meta: { vault: vaultObject, post: tPost },
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

	const bookmark = await getBookmarkObject();

	return (
		<PageWithTransition>
			<Client />
			<MyHead
				title={title}
				description={tPost?.metadata.frontmatter?.desc ?? ""}
				imagePath={tPost?.thumbnailPath}
				url={postPathAbsolute}
				keywords={[]}
			/>

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
				{bookmark.items.length > 0 && <BookmarkInnerPart root={bookmark} />}
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
