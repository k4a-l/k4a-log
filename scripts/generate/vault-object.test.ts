import type {} from "hast";
import type { RootContent } from "mdast";

import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { notesDirPath } from "@/features/metadata/constant";
import type { TPostMetaData } from "@/features/metadata/type";
import { expect, test } from "vitest";
import {
	convertRootContentsToFileMetadata,
	createVaultFile,
} from "./vault-object";

const json = fs.readFileSync(
	path.join(__dirname, "root-contents.json"),
	"utf-8",
);
const parsedJson = JSON.parse(json) as RootContent[];

test("1", () => {
	const result = convertRootContentsToFileMetadata(
		parsedJson,
		`/${notesDirPath}/tests/SOME.md`,
	);
	const expected: TPostMetaData = {
		embeds: [
			{
				title: "COMMON",
				aliasTitle: "Embed link",
				path: String.raw`/${notesDirPath}\tests\SYNTAX TEST\COMMON`,
			},
		],
		headings: [
			{ level: 1, text: "HEADING1" },
			{ level: 2, text: "HEADING2" },
		],
		links: [
			{
				path: String.raw`/${notesDirPath}\tests\SYNTAX TEST\COMMON`,
				title: "COMMON",
				aliasTitle: "link",
			},
		],
		listItems: [
			{
				text: "list-A",
				parentLineNumber: -1,
				lineNumber: 12,
				id: expect.anything(),
			},
			{
				text: "list-B",
				parentLineNumber: 12,
				lineNumber: 13,
				id: expect.anything(),
			},
			{
				text: "list-A-1",
				parentLineNumber: 12,
				lineNumber: 14,
				id: expect.anything(),
			},
			{
				text: "list-A-2",
				parentLineNumber: 14,
				lineNumber: 15,
				id: expect.anything(),
			},
			{
				text: "list-1",
				parentLineNumber: -1,
				lineNumber: 16,
				id: expect.anything(),
			},
			{
				task: " ",
				text: "uncompleted",
				parentLineNumber: 16,
				lineNumber: 17,
				id: expect.anything(),
			},
			{
				task: "x",
				text: "completed",
				parentLineNumber: 16,
				lineNumber: 18,
				id: expect.anything(),
			},
		],
		tags: [{ tag: "tag" }],
		frontmatter: {},
	};

	expect(result).toStrictEqual(expected);
});

test("ゴールデンマスターテスト", async () => {
	const masterData = JSON.parse(
		await readFile(path.join(__dirname, "vault.json"), {
			encoding: "utf-8",
		}),
	);
	const createdData = await createVaultFile();
	// stringifyするとundefinedプロパティがなくなるので同条件にする
	const createdDataParsed: typeof createdData = JSON.parse(
		JSON.stringify(createdData),
	);
	const createDataIDOmitted = {
		...createdDataParsed,
		notes: createdDataParsed.notes.map((p) => ({
			...p,
			metadata: {
				...p.metadata,
				listItems: p.metadata.listItems.map((l) => ({
					...l,
					id: expect.anything(),
				})),
			},
		})),
	} satisfies typeof createdData;

	expect(createDataIDOmitted).toStrictEqual(masterData);
});
