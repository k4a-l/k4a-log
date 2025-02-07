export type Folder = { name: string; path: string } & (
	| {
			type: "folder";
			children: Folder[];
	  }
	| {
			type: "file";
	  }
);

export function buildFileTree(
	files: { path: string; title: string }[],
): Folder[] {
	const tree: Folder[] = [];
	const pathMap: Map<string, Folder> = new Map();

	for (const file of files) {
		const path = file.path;
		const parts = path.split("/").filter(Boolean);
		let currentLevel = tree;
		let currentPath = "";

		for (const [index, part] of parts.entries()) {
			currentPath += `/${part}`;
			let node = pathMap.get(currentPath);

			if (!node) {
				node = {
					name: part,
					path: currentPath,
					type: index === parts.length - 1 ? "file" : "folder",
					...(index === parts.length - 1 ? {} : { children: [] }),
				} as Folder;

				pathMap.set(currentPath, node);
				currentLevel.push(node);
			}

			if (node.type === "folder") {
				currentLevel = node.children;
			}
		}
	}

	return tree;
}
