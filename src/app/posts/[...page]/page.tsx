import path from "node:path";
import { getFileContent } from "@/wikilink/file";
import { createProcessor } from "@/wikilink/processor";
import { createFileTrees } from "@/wikilink/util";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";
import { Center, Stack } from "styled-system/jsx";

const directoryPath = "./assets/posts";

export default async function Home({ params }: { params: { page: string[] } }) {
	const paths = (await params).page;

	const fileTrees = createFileTrees(directoryPath);
	const processor = createProcessor(fileTrees, [path.join(...paths)]);

	const data = await getFileContent(paths, directoryPath, processor);
	return (
		<Center className={css({ px: 10, py: 4 })}>
			<Stack maxW={"1000px"}>
				<div
					className={css({
						fontSize: "1.5em",
						fontWeight: "bold",
						borderBottomWidth: "6",
						borderBottomColor: "gray.3",
					})}
				>
					{data.title}
				</div>
				<div>{data.content}</div>
			</Stack>
		</Center>
	);
}
