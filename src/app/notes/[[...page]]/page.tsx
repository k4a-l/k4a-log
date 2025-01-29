import path from "node:path";

import { BookmarkInnerPart } from "@/components/Bookmark";
import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { FrontMatter } from "@/components/FrontMatter";
import { MyHead } from "@/components/Head";
import { NoteNotFound } from "@/components/Note/NotFound";
import { BackLinks, TwoHopLinks } from "@/components/NoteLink";
import { SideTableOfContents } from "@/components/Toc";
import { getBookmarkObject, getVaultObject } from "@/features/file/io";
import { assetsDirPath, notesDirPath } from "@/features/metadata/constant";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { getFileContent } from "@/features/remark/processor/getContent";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { createFileTrees } from "@/features/remark/wikilink/util";
import { reverseObjects } from "@/utils/object";
import { isSamePath, normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { HStack, Spacer, Stack } from "styled-system/jsx";

import { Client } from "./Client";

export const revalidate = 600; // 10分ごとに再検証する

const directoryPath = path.join(assetsDirPath, notesDirPath);

type Params = Promise<{ page: string[] | undefined }>;

type Props = { params: Params };

export default async function Page({ params }: Props) {
	// 生の値取得→noteDirはついてない
	const pathsFromParams = (await params).page ?? ["Index"];
	const pathFromParams = path.join(...pathsFromParams);

	// metadataの取得
	const vaultObject = getVaultObject();

	// uid→pathの検索
	const uidPathMap = reverseObjects(vaultObject.pathMap);

	// uidに一致すればそれを使用、しなければそのまま
	const notePath =
		uidPathMap[normalizePath(path.join(notesDirPath, pathFromParams))]?.replace(
			notesDirPath,
			"",
		) ?? pathFromParams;

	const notePathAbsolute = path.join("/", notesDirPath, notePath);
	const tNote = vaultObject.notes.find((p) =>
		isSamePath(p.path, notePathAbsolute),
	);

	if (!tNote) return <NoteNotFound href={pathFromParams} />;

	// このファイルの事前準備
	const fileTrees = createFileTrees(directoryPath);
	const parseProcessor = createParseProcessor(fileTrees, [notePath]);
	const runProcessor = createRunProcessor({
		listItems: tNote.metadata.listItems,
	});
	const stringifyProcessor = createStringifyProcessor({
		pathMap: vaultObject.pathMap,
		meta: { vault: vaultObject, note: tNote },
	});

	// 実行
	const fileData = getFileContent(
		notePath.split(/\\|\//),
		directoryPath,
		parseProcessor,
		runProcessor,
		stringifyProcessor,
	);

	if (!fileData) return <NoteNotFound href={pathFromParams} />;
	// データ加工
	const { frontmatter } = fileData.data;

	const title: string = frontmatter?.title || fileData.title;

	const bookmark = getBookmarkObject();

	return (
		<PageWithTransition>
			<Client />
			<MyHead
				description={tNote.metadata.frontmatter?.description || ""}
				imagePath={
					tNote.metadata.frontmatter?.thumbnailPath || tNote.thumbnailPath
				}
				keywords={[]}
				title={title}
				url={notePathAbsolute}
			/>

			<HStack
				alignItems={"start"}
				className={`${css({
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}, `}
				h="100%"
				justifyContent={"center"}
				w="100%"
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
						<div className="md-note-container">{fileData.content}</div>
					</Stack>
					<Spacer h={4} />
					{tNote?.backLinks.length ? (
						<Stack
							className={css({
								bg: "white",
								p: 2,
								rounded: "md",
								gap: 2,
							})}
						>
							<BackLinks tNote={tNote} />
						</Stack>
					) : null}
					{tNote?.twoHopLinks.length ? (
						<Stack
							className={css({
								bg: "white",
								p: 2,
								rounded: "md",
								gap: 2,
							})}
						>
							<TwoHopLinks tNote={tNote} />
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
