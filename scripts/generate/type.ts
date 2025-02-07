import type { TNoteIndependence } from "@/features/metadata/type";

export type FileEntity = TNoteIndependence & {
	type: "file";
};
export type FileOrDirEntity =
	| FileEntity
	| { type: "dir"; name: string; children: FileOrDirEntity[] };
