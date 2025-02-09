import path from "node:path";

import { PageWithTransition } from "@/components/Common/pageWithTransition";
import { FrontMatter } from "@/components/FrontMatter";
import { MyHead } from "@/components/Head";
import { BeforeAfterNote } from "@/components/Note/BeforeAfter";
import { NoteNotFound } from "@/components/Note/NotFound";
import { BackLinks, TwoHopLinks } from "@/components/NoteLink";
import { SideTableOfContents } from "@/components/Toc";
import { getVaultObject } from "@/features/file/io";
import { blogDirPath } from "@/features/metadata/constant";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { getFileContent } from "@/features/remark/processor/getContent";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { reverseObjects } from "@/utils/object";
import {
	isSamePath,
	normalizePath,
	safeDecodeURIComponent,
} from "@/utils/path";
import { css } from "styled-system/css";
import { Spacer, Stack } from "styled-system/jsx";

import { Client } from "./Client";

export const revalidate = 600; // 10分ごとに再検証する

type Params = Promise<{ page: string[] | undefined }>;

type Props = { params: Params };

const vaultObject = getVaultObject();

export default async function Page({ params }: Props) {
	// 生の値取得→noteDirはついてない
	const pathsFromParams = (await params).page ?? ["Index"];
	const pathFromParams = path.join(...pathsFromParams);

	// metadataの取得
	const start = performance.now();
	// TODOファイルごとに分割

	// uid→pathの検索
	const uidPathMap = reverseObjects(vaultObject.pathMap);

	// uidに一致すればそれを使用、しなければそのまま
	const notePath = safeDecodeURIComponent(
		uidPathMap[normalizePath(path.join(pathFromParams))] ?? pathFromParams,
	);

	const notePathAbsolute = safeDecodeURIComponent(path.join("/", notePath));
	const tNote = vaultObject.notes.find((p) =>
		isSamePath(p.path, notePathAbsolute),
	);

	if (!tNote) return <NoteNotFound href={pathFromParams} />;

	// このファイルの事前準備
	const parseProcessor = createParseProcessor(
		[notePath],
		[
			...vaultObject.notes.map((p) => ({
				absPath: p.path,
				name: p.basename,
			})),
			...vaultObject.assets.map((p) => ({
				absPath: p.path,
				name: p.basename,
			})),
		],
	);
	const runProcessor = createRunProcessor({
		listItems: tNote.metadata.listItems,
	});
	const stringifyProcessor = createStringifyProcessor({
		pathMap: vaultObject.pathMap,
		meta: { vault: vaultObject, note: tNote },
	});

	console.log("getFileContent start", performance.now() - start);

	// 実行→やっぱここが重い？
	// parseが割と軽くなったのでやっぱここ
	const fileData = getFileContent(
		notePath.split(/\\|\//),
		parseProcessor,
		runProcessor,
		stringifyProcessor,
	);
	console.log(" getFileContent end", performance.now() - start);

	if (!fileData) return <NoteNotFound href={pathFromParams} />;
	// データ加工
	const { frontmatter } = fileData.data;

	const title: string = frontmatter?.title || fileData.title;

	return (
		<>
			<Client />
			<MyHead
				description={tNote.metadata.frontmatter?.description || ""}
				imagePath={tNote.thumbnailPath}
				keywords={[]}
				title={title}
				url={notePathAbsolute}
			/>
			<Stack
				maxW={"max(1000px,100%)"}
				minW={0}
				w={{ base: "100%", lg: "700px", xl: "1000px" }}
				flexShrink={1}
			>
				<PageWithTransition>
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
						<div
							className={`md-note-container ${css({
								minW: 0,
							})}`}
						>
							{fileData.content}
						</div>
					</Stack>
				</PageWithTransition>
				<Spacer h={4} />

				{normalizePath(tNote.path).startsWith(
					normalizePath(path.join(blogDirPath)),
				) ? (
					<BeforeAfterNote note={tNote} vault={vaultObject} />
				) : null}

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
		</>
	);
}
