import { readdir } from "node:fs/promises";

export async function getFileList(path: string): Promise<string[]> {
	try {
		const files = await readdir(path);
		return files;
	} catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
}
