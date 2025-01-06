import type { VFile } from "vfile";
import { matter } from "vfile-matter";

export default function HandleYamlMatterPlugin() {
	return (tree: Node, file: VFile) => {
		const a = matter(file);
	};
}
