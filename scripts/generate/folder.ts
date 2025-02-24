export type Folder = { title: string; path: string } & (
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
					title: index === parts.length - 1 ? file.title : part,
					path: currentPath,
					type: index === parts.length - 1 ? "file" : "folder",
					...(index === parts.length - 1 ? {} : { children: [] }),
				} as Folder;

				pathMap.set(currentPath, node);
				currentLevel.push(node);
				currentLevel.sort((a, b) =>
					a.type === "folder" && b.type === "file"
						? -1
						: a.type === "file" && b.type === "folder"
							? 1
							: 0,
				);
			}

			if (node.type === "folder") {
				currentLevel = node.children;
			}
		}
	}

	return tree;
}
