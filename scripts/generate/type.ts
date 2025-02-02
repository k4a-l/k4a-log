import type { VFileData } from "@/features/remark/frontmatter";
import type { Root } from "node_modules/remark-parse/lib";

export type FileEntity = {
	type: "file";
	name: string;
	path: string;
	root: Root;
	fileData: VFileData;
};
export type FileOrDirEntity =
	| FileEntity
	| { type: "dir"; name: string; children: FileOrDirEntity[] };
