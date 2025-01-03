"use client";

import type { WikiLinkData } from "@/types/mdast";
import Link from "next/link";
import type { AnchorHTMLAttributes, FC } from "react";
import { css } from "styled-system/css";

export const CustomLink: FC<
	AnchorHTMLAttributes<HTMLAnchorElement> & WikiLinkData["hProperties"]
> = ({ href, children, isEmbed, ...others }) => {
	console.log(isEmbed);

	if (isEmbed) {
		return <span className={css({ bg: "red", color: "blue" })}>e</span>;
	}

	if (!href) {
		return (
			<Link
				{...others}
				href={":"}
				scroll={false}
				style={{ color: "gray" }}
				onClick={(e) => {
					e.preventDefault();
				}}
			>
				{children}
			</Link>
		);
	}

	return <Link href={href}>{children}</Link>;
};
