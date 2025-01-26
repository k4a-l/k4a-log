export type BookMarkItem =
	| { type: "file"; path: string; title?: string }
	| { type: "group"; title: string; items: BookMarkItem[] };

export type BookMarkRoot = { items: BookMarkItem[] };
