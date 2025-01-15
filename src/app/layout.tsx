import Scroll from "@/components/Hook/Scroll";
import "../../styled-system/styles.css";
import "./index.css";
import { getSearchPath } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { SummarizeByYM } from "@/components/Summazize";
import { postDirPath } from "@/constants/path";
import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { HashIcon, SearchIcon } from "lucide-react";
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
						<Button
							size="xs"
							asChild
							px={2}
							h="100%"
							variant={"ghost"}
							textDecoration={"none"}
							// fontWeight={"normal"}
							gap={0}
						>
							<NextLink href={getSearchPath({})}>
								<HashIcon strokeWidth={2} />
								/
								<SearchIcon strokeWidth={2} />
							</NextLink>
						</Button>
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
