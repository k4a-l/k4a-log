import { fromDateParamString, searchQueryKey } from "@/app/search/util";
import { getVaultObject } from "@/features/file/io";
import {} from "@/features/metadata/constant";
import { Hono } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { pageViewLength, sortStrategy } from "./constant";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { idParser } from "@/features/remark/frontmatter";
import { IS_PRODUCTION } from "@/utils/env";
import { isTestDirPath } from "@/utils/path";

export type NoteMeta = {
	title: string;
	path: string;
	thumbnailPath?: string;
	created?: string;
	updated?: string;
	description: string;
};

async function getFileList(path: string): Promise<string[]> {
	try {
		const files = await readdir(path);
		return files;
	} catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
}

export const searchAPI = new Hono<BlankEnv, BlankInput, "/">().get(
	"/",
	async (
		c,
	): Promise<
		ReturnType<
			typeof c.json<{
				notes: NoteMeta[];
				allNumber: number;
			}>
		>
	> => {
		// おまじない：これを書いておかないとvercelのバンドルに含まれない
		await getFileList(process.cwd());
		await getFileList(path.join(process.cwd(), "assets/metadata"));

		const query = c.req.query(searchQueryKey.query);
		const tag = c.req.query(searchQueryKey.tag);
		const created = c.req.query(searchQueryKey.created);
		const sort =
			c.req.query(searchQueryKey.sort) ?? sortStrategy["created-new"];
		const hasLink = c.req.query(searchQueryKey.hasLink);

		const pageStr = c.req.query(searchQueryKey.page);
		const pageNum = pageStr ? Number.parseInt(pageStr) : 0;

		const vaultObject = getVaultObject();

		const targets: NoteMeta[] = vaultObject.notes
			.filter((p) => !(IS_PRODUCTION && isTestDirPath(p.path)))
			.filter((p) => {
				const isTagIncluded = (() => {
					if (!tag) return true;
					return p.metadata?.tags?.some((t) => t.tag === tag);
				})();

				const isCreatedDateMatch = (() => {
					if (!created) return true;
					if (!p.metadata.frontmatter?.created) return false;

					const { year: targetYear, month: targetMonth } =
						fromDateParamString(created) ?? {};
					const createdDate = new Date(p.metadata.frontmatter.created);

					if (!targetYear) {
						return true;
					}
					if (targetYear !== createdDate.getFullYear()) {
						return false;
					}

					if (targetMonth) {
						return targetMonth === createdDate.getMonth() + 1;
					}

					return true;
				})();

				const isQueryMatch = (() => {
					if (!query) return true;
					return p.basename.toLowerCase().includes(query.toLowerCase());
				})();

				const isHasLinkMatch = (() => {
					if (!hasLink) return true;
					return [...p.metadata.links, ...p.metadata.embeds].find(
						(l) => l.title === hasLink,
					);
				})();

				return (
					isTagIncluded && isCreatedDateMatch && isQueryMatch && isHasLinkMatch
				);
			})
			.map((p) => {
				const frontmatter = p.metadata.frontmatter;
				const id = idParser(p, frontmatter);
				return {
					title: frontmatter?.title || p.basename,
					path: id || p.path,
					thumbnailPath: frontmatter?.thumbnailPath || p.thumbnailPath,
					created: frontmatter?.created,
					updated: frontmatter?.updated,
					description: frontmatter?.description ?? "",
				};
			})
			.sort((a, b) => {
				if (sort === "created-new") {
					// 設定なしは常に最後
					if (!a.created && !a.created) return 0;
					if (!a.created) return 1;
					if (!b.created) return -1;
					return a.created < b.created ? 1 : -1;
				}
				if (sort === "created-old") {
					if (!a.created && !a.created) return 0;
					if (!a.created) return 1;
					if (!b.created) return -1;
					return a.created > b.created ? 1 : -1;
				}
				if (sort === "updated-new") {
					if (!a.updated && !a.updated) return 0;
					if (!a.updated) return 1;
					if (!b.updated) return -1;
					return a.updated < b.updated ? 1 : -1;
				}
				if (sort === "updated-old") {
					if (!a.updated && !a.updated) return 0;
					if (!a.updated) return 1;
					if (!b.updated) return -1;
					return a.updated > b.updated ? 1 : -1;
				}
				if (sort === "title-asc") return a.title > b.title ? 1 : -1;
				if (sort === "title-desc") return a.title < b.title ? 1 : -1;

				return 0;
			});
		const limited = targets.slice(
			pageNum * pageViewLength,
			(pageNum + 1) * pageViewLength,
		);

		return c.json({
			notes: limited,
			allNumber: targets.length,
		});
	},
);
