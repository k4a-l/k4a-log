import { createProcessor } from "@/wikilink/processor";
import {
	createFileTrees,
	directoryPath,
	getFileContent,
} from "@/wikilink/util";
import {} from "react/jsx-runtime";
import { css } from "styled-system/css";

const fileTrees = createFileTrees(directoryPath);

const currentPaths = ["tests", "SYNTAX TEST", "ORIGINAL"];

const processor = createProcessor(fileTrees, currentPaths);

export default async function Home({ params }: { params: { page: string[] } }) {
	const paths = (await params).page;

	const data = await getFileContent(paths, directoryPath, processor);
	return <div className={css({ p: 2 })}>{data}</div>;
}
