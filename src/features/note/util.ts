export type NoteMeta = {
	title: string;
	path: string;
	thumbnailPath?: string;
	created?: string;
	updated?: string;
	description: string;
};

export const sortByCreatedNew = (
	a: Pick<NoteMeta, "created">,
	b: Pick<NoteMeta, "created">,
): number => {
	// 設定なしは常に最後
	if (!a.created && !a.created) return 0;
	if (!a.created) return 1;
	if (!b.created) return -1;
	return a.created < b.created ? 1 : -1;
};
