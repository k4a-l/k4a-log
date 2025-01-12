import { readFile } from "node:fs/promises";
import { fromDateParamString, searchQueryKey } from "@/app/search/util";
import { vaultMetadataFilePath } from "@/features/metadata/constant";
import type { TVault } from "@/features/metadata/type";
import { Hono } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { pageViewLength, sortStrategy } from "./constant";

export type PostMeta = {
	title: string;
	path: string;
	thumbnailPath?: string;
	created?: string;
	updated?: string;
};

export const searchAPI = new Hono<BlankEnv, BlankInput, "/">().get(
	"/",
	async (
		c,
	): Promise<
		ReturnType<
			typeof c.json<{
				posts: PostMeta[];
				allNumber: number;
			}>
		>
	> => {
		const query = c.req.query(searchQueryKey.query);
		const tag = c.req.query(searchQueryKey.tag);
		const created = c.req.query(searchQueryKey.created);
		const sort =
			c.req.query(searchQueryKey.sort) ?? sortStrategy["created-new"];

		const pageStr = c.req.query(searchQueryKey.page);
		const pageNum = pageStr ? Number.parseInt(pageStr) : 0;

		const vaultFileContent = await readFile(vaultMetadataFilePath, {
			encoding: "utf-8",
		});
		const vaultObject: TVault = JSON.parse(vaultFileContent);

		const targetPosts: PostMeta[] = vaultObject.posts
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
					const postCreatedDate = new Date(p.metadata.frontmatter.created);

					if (!targetYear) {
						return true;
					}
					if (targetYear !== postCreatedDate.getFullYear()) {
						return false;
					}

					if (targetMonth) {
						return targetMonth === postCreatedDate.getMonth() + 1;
					}

					return true;
				})();

				const isQueryMatch = (() => {
					if (!query) return true;
					return p.basename.toLowerCase().includes(query.toLowerCase());
				})();

				return isTagIncluded && isCreatedDateMatch && isQueryMatch;
			})
			.map((p) => ({
				title: p.basename,
				path: p.path,
				thumbnailPath: p.thumbnailPath,
				created: p.metadata.frontmatter?.created,
				updated: p.metadata.frontmatter?.updated,
			}))
			.sort((a, b) => {
				if (sort === "created-new")
					return (a.created ?? Number.MAX_SAFE_INTEGER) <
						(b.created ?? Number.MAX_SAFE_INTEGER)
						? 1
						: -1;
				if (sort === "created-old")
					return (a.created ?? -1) > (b.created ?? -1) ? 1 : -1;
				if (sort === "updated-new")
					return (a.updated ?? Number.MAX_SAFE_INTEGER) <
						(b.updated ?? Number.MAX_SAFE_INTEGER)
						? 1
						: -1;
				if (sort === "updated-old")
					return (a.updated ?? -1) > (b.updated ?? -1) ? 1 : -1;
				if (sort === "title-asc") return a.title > b.title ? 1 : -1;
				if (sort === "title-desc") return a.title < b.title ? 1 : -1;

				return 0;
			});
		const postsLimited = targetPosts.slice(
			pageNum * pageViewLength,
			(pageNum + 1) * pageViewLength,
		);

		return c.json({
			posts: postsLimited,
			allNumber: vaultObject.posts.length,
		});
	},
);
