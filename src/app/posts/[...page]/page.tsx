import path from "node:path";
import { FrontMatter } from "@/components/FrontMatter";
import {
	createRunProcessor,
	createStringifyProcessor,
} from "@/features/remark/processor";
import { createParseProcessor } from "@/features/remark/processor/parse";
import { getFileContent as getFileData } from "@/features/remark/wikilink/file";
import { createFileTrees } from "@/features/remark/wikilink/util";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";
import { Center, Stack } from "styled-system/jsx";

const directoryPath = "./assets/posts";

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
				<Stack maxW={"1000px"}>
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
					{frontMatter ? <FrontMatter frontMatter={frontMatter} /> : null}
					<div>{fileData.content}</div>
				</Stack>
			</Center>
		</>
	);
}
