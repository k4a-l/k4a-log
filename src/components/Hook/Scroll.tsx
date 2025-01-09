"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// https://github.com/vercel/next.js/issues/45187#issuecomment-1639518030
// TODO:暫定対処なのでできればやめたい
export default function Scroll() {
	// when clicking a link, user will not scroll to the top of the page if the header is sticky.
	// their current scroll position will persist to the next page.
	// this useEffect is a workaround to 'fix' that behavior.

	const pathname = usePathname();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// ヘッダーリンクの場合はスクロールしない
		if (window.location.hash) return;
		window.scroll(0, 0);
	}, [pathname]);
	return <></>;
}
