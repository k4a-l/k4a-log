import Scroll from "@/components/Hook/Scroll";
import "../../styled-system/styles.css";
import "./index.css";

import { SearchBox } from "@/app/search/SearchBox";
import { NextLink } from "@/components/Link/NextLink";
import { SummarizeByYM } from "@/components/Summazize";
import { postDirPath } from "@/constants/path";
import { Link } from "@/park-ui/components/link";
import Image from "next/image";
import type React from "react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

export const HEADER_HEIGHT = "34px";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<Scroll />
			<body>
				<Stack
					w="full"
					minH="full"
					h="auto"
					className={css({
						bgColor: "neutral.100",
						fontSize: { sm: "1em", base: "0.8em" },
					})}
				>
					<HStack
						className={css({
							bg: "white",
							position: "sticky",
							top: 0,
							zIndex: 1,
							h: HEADER_HEIGHT,
							px: 1,
							py: 1,
							boxShadow: "sm",
							w: "full",
						})}
						justifyContent={"space-between"}
					>
						<Link asChild>
							<NextLink href={postDirPath}>
								<Image
									src="/assets/logo.png"
									alt="logo"
									width={40}
									height={40}
								/>
							</NextLink>
						</Link>
						<SearchBox />
					</HStack>
					<Stack w="full" minH="full" h="auto" flex={1}>
						<Stack
							flex={1}
							w="full"
							minH="full"
							h="auto"
							justifyContent={"start"}
							alignItems={"center"}
							p={4}
						>
							{children}
						</Stack>
						<HStack
							gap={1}
							className={css({
								bg: "white",
							})}
							justify={"center"}
							w="full"
							p={8}
						>
							<HStack maxW={"max(1000px,100%)"} w={"min(1000px,100%)"}>
								<SummarizeByYM />
							</HStack>
						</HStack>
					</Stack>
				</Stack>
			</body>
		</html>
	);
}
