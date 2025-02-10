import fs from "node:fs";
import { dirname } from "path-browserify";

export const writeFileRecursive = async (
	path: string,
	contents: string,
): Promise<void> => {
	await fs.mkdirSync(dirname(path), { recursive: true });
	await fs.writeFileSync(path, contents);
};
