import type { Result } from "mdast-util-toc";

export type VFileData = {
	frontmatter?: Record<string, unknown>;
	toc: Result["map"];
};
