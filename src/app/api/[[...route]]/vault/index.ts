// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { readFileSync } from "fs";

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import path from "path-browserify";

import { getVaultObject } from "@/features/file/io";
import { fetchFileFromRepo } from "@/utils/fetch";
import {
	convertPathsToLocalMD,
	convertPathsToMD,
	isSamePath,
} from "@/utils/path";

import { getFileList } from "../../util";

import type { TListItemMetaData, TVault } from "@/features/metadata/type";
import type { BlankEnv, BlankInput } from "hono/types";

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

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN is not set");
export const noteAPI = new Hono<BlankEnv, BlankInput, "/">().get(
	"/",
	async (c) => {
		// おまじない：これを書いておかないとvercelのバンドルに含まれない
		await getFileList(process.cwd());
		await getFileList(path.join(process.cwd(), "assets/metadata"));

		const href = decodeURIComponent(c.req.query("path") ?? "").split("#")[0];
		if (!href) throw new HTTPException(404);

		const note = vault.notes.find((p) => isSamePath(p.path, href));
		if (!note) throw new HTTPException(404);

		const response = {
			pathMap: vault.pathMap,
			vaultPaths: [...vault.notes, ...vault.assets].map((p) => ({
				absPath: p.path,
				name: p.basename,
			})),
			note,
		};

		if (href.startsWith("/tests")) {
			const { fPath } = convertPathsToLocalMD([href]);
			const fileContent = readFileSync(fPath, { encoding: "utf-8" });
			return c.json({
				...response,
				fileContent,
			});
		}

		try {
			const { fPath } = convertPathsToMD([href]);
			const fileContent = await fetchFileFromRepo({
				owner: "k4a-l",
				repo: "k4a-log-content",
				path: fPath,
				token: token,
			});

			return c.json({
				...response,
				fileContent,
			});
		} catch (error) {
			console.error("コンテンツの取得でエラー", { href }, error);
			throw new HTTPException(404);
		}
	},
);
