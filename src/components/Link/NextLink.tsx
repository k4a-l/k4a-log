import Link from "next/link";
import type { ComponentProps } from "react";

// https://github.com/vercel/next.js/issues/45187#issuecomment-1639518030 問題何とかしたい...
// TODO:暫定対処なのでできればやめたい
export const NextLink = ({
	...props
}: ComponentProps<typeof Link> & { href: string }) => {
	return <Link {...props} />;
};
