import Link from "next/link";

import { Button } from "@/park-ui/components/button";
import { IconButton } from "@/park-ui/components/icon-button";

import type { ComponentProps } from "react";
import type { StrictOmit } from "ts-essentials";

// https://github.com/vercel/next.js/issues/45187#issuecomment-1639518030 問題何とかしたい...
// TODO:暫定対処なのでできればやめたい
export const NextLink = ({
	...props
}: ComponentProps<typeof Link> & { href: string }) => {
	return <Link {...props} />;
};

export const NextLinkButton = (
	props: StrictOmit<ComponentProps<typeof Button>, "asChild"> & {
		href: string;
	},
) => {
	const { disabled, children, ...others } = props;

	if (disabled) {
		return <Button {...props} />;
	}

	return (
		<Button fontWeight={"normal"} textDecoration={"none"} {...others} asChild>
			<NextLink href={props.href}>{children}</NextLink>
		</Button>
	);
};

export const NextLinkIconButton = (
	props: StrictOmit<ComponentProps<typeof Button>, "asChild"> & {
		href: string;
	},
) => {
	const { disabled, children, ...others } = props;

	if (disabled) {
		return <Button {...props} />;
	}

	return (
		<IconButton
			fontWeight={"normal"}
			textDecoration={"none"}
			{...others}
			asChild
		>
			<NextLink href={props.href}>{children}</NextLink>
		</IconButton>
	);
};
