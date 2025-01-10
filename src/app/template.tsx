"use client";

import { NextLink } from "@/components/Link/NextLink";
import { postDirPath } from "@/constants/path";
import { colors } from "@/constants/theme";
import { Link } from "@/park-ui/components/link";
import Image from "next/image";
import type React from "react";
import { css } from "styled-system/css";
import { HStack } from "styled-system/jsx";

export const HEADER_HEIGHT = "34px";

export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HStack
				className={css({
					bg: colors["header-background"],
					position: "sticky",
					top: 0,
					zIndex: 1,
					h: HEADER_HEIGHT,
					px: 1,
					py: 1,
					boxShadow: "sm",
				})}
				justifyContent={"space-between"}
			>
				<Link asChild>
					<NextLink href={postDirPath}>
						<Image src="/assets/logo.png" alt="logo" width={40} height={40} />
					</NextLink>
				</Link>
				<input
					className={css({
						border: "none",
						// borderColor: "gray.2",
						// outline: "none",
						padding: "0.5rem",
						borderRadius: "sm",
						width: "max(50%,300px)",
						height: "full",
						bg: "white",

						// boxShadow: "0 0 0 1px #ccc",
					})}
					type="search"
				/>
			</HStack>

			{children}
		</>
	);
}
