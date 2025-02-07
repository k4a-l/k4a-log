import type {} from "hast";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "vitest";

import { createVaultFile } from "./vault-object";

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
