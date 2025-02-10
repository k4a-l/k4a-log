import { Hono } from "hono";

import { getVaultObject } from "@/features/file/io";

import type { BlankEnv, BlankInput } from "hono/types";
import type { TListItemMetaData, TVault } from "@/features/metadata/type";
import {} from "@/features/remark/processor";
import { convertPathsToMD, isSamePath } from "@/utils/path";
import { HTTPException } from "hono/http-exception";
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { readFileSync } from "fs";
import { getFileList } from "../../util";
import path from "node:path";

const vault = getVaultObject();

export type TasksResponse = {
	title: string;
	path: string;
	tasks: TListItemMetaData[];
};

export const vaultAPI = new Hono<BlankEnv, BlankInput, "/">()
	.get("/", async (c): Promise<ReturnType<typeof c.json<TVault>>> => {
		return c.json(vault);
	})
	.get(
		"/tasks",
		async (c): Promise<ReturnType<typeof c.json<TasksResponse[]>>> => {
			// おまじない：これを書いておかないとvercelのバンドルに含まれない
			await getFileList(process.cwd());
			await getFileList(path.join(process.cwd(), "assets/metadata"));
			const tasks = vault.notes
				.filter((p) => p.metadata.listItems.some((l) => l.task))
				.map((p) => ({
					title: p.metadata.frontmatter?.title || p.basename,
					path: p.path,
					tasks: p.metadata.listItems.filter((l) => l.task),
				}));
			return c.json(tasks);
		},
	);

export const noteAPI = new Hono<BlankEnv, BlankInput, "/">().get(
	"/",
	async (c) => {
		// おまじない：これを書いておかないとvercelのバンドルに含まれない
		await getFileList(process.cwd());
		await getFileList(path.join(process.cwd(), "assets/metadata"));

		const href = decodeURIComponent(c.req.query("path") ?? "").split("#")[0];
		if (!href) throw new HTTPException(404);

		const note = vault.notes.find((p) => isSamePath(p.path, href));
		const { fPath } = convertPathsToMD([href]);
		try {
			const fileContent = readFileSync(fPath, { encoding: "utf-8" });
			if (!note) throw new HTTPException(404);

			return c.json({
				pathMap: vault.pathMap,
				vaultPaths: [...vault.notes, ...vault.assets].map((p) => ({
					absPath: p.path,
					name: p.basename,
				})),
				note,
				fileContent,
			});
		} catch (error) {
			console.error("コンテンツの取得でエラー", { fPath, href }, error);
			throw new HTTPException(404);
		}
	},
);
