// AA#tag BB#tag という文章があったとき、[AA,#tag,BB,#tag]にする関数
export const splitByHashtag = (input: string): string[] => {
	const result = input.split(/(#[^\s]+)/g).filter(Boolean);
	return result;
};
