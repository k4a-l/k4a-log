import Link from "next/link";

import { Button } from "@/park-ui/components/button";
import { IconButton } from "@/park-ui/components/icon-button";

import type { ComponentProps } from "react";
import type { StrictOmit } from "ts-essentials";

// TODO: https://github.com/vercel/next.js/issues/45187#issuecomment-1639518030 問題何とかしたい...
export const NextLink = ({
	href,
	...props
}: StrictOmit<ComponentProps<typeof Link>, "href"> & {
	href: string | undefined;
}) => {
	if (!href) return <span {...props} />;
	return <Link {...props} href={href} />;
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
