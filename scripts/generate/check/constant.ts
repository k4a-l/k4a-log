// ENVから読み込む
// このリポジトリをpublicにするならワードを公開するのは良くない
// ただその場合Envの設定漏れなどが怖い
// 確実に設定する文字列みたいなのを仕込んでおく

export const NG_WORDS = JSON.parse(process.env.NG_WORDS ?? "");
if (!Array.isArray(NG_WORDS)) throw new Error("NG_WORDSは配列にしてください");
if (!NG_WORDS.includes("__CHECK")) {
	throw new Error("NG_WORDSに__CHECKを含めてください");
}

export type NoteCondition = {
	// perfect match
	tags?: string[];
	// start with match
	paths?: string[];
	// contain match
	titles?: string[];
	// perfect match
	frontmatter?: Record<string, string | string[]>;
};

// これもenvにすべきだけど、面倒なのと公開しても問題ないのでそのまま
export const PUBLIC_CONDITION: NoteCondition = {
	tags: ["public"],
	paths: ["public", "blog", "tests"],
	titles: [],
	frontmatter: { publish: "true" },
};
