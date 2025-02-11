export const fetchFileFromRepo = async ({
	owner,
	repo,
	path,
	token,
}: {
	owner: string;
	repo: string;
	path: string;
	token: string;
}): Promise<string> => {
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `token ${token}`,
			Accept: "application/vnd.github.v3.raw", // ファイルの生データを取得
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch file: ${response.status} ${response.statusText}`,
		);
	}

	const result = await response.text(); // ファイルの内容を取得
	return result;
};
