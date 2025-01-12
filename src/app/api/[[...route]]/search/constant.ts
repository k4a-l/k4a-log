export const sortStrategy = {
	"created-new": "created-new",
	"created-old": "created-old",
	"updated-new": "updated-new",
	"updated-old": "updated-old",
	"title-asc": "title-asc",
	"title-desc": "title-desc",
} as const satisfies Record<string, string>;

export const sortByItems = [
	{ label: "作成日時（新しい順）", value: sortStrategy["created-new"] },
	{ label: "作成日時（古い順）", value: sortStrategy["created-old"] },
	{ label: "更新日時（新しい順）", value: sortStrategy["updated-new"] },
	{ label: "更新日時（古い順）", value: sortStrategy["updated-old"] },
	{ label: "タイトル（昇順）", value: sortStrategy["title-asc"] },
	{ label: "タイトル（降順）", value: sortStrategy["title-desc"] },
] as const satisfies { label: string; value: keyof typeof sortStrategy }[];

export const pageViewLength = 20;
