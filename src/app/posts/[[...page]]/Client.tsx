"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const Client = () => {
	const params = useSearchParams();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const { hash } = window.location;
		if (hash) {
			const id = hash.replace("#", "");
			const targetElement = document.getElementById(id);
			if (targetElement) {
				targetElement.classList.add("highlight");
				// 強調表示を一定時間後に解除
				setTimeout(() => {
					targetElement.classList.remove("highlight");
				}, 2000);
			}
		}
	}, [params]); // ページ遷移時に再実行

	return <></>;
};
