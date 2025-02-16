import "../../styled-system/styles.css";
import "./index.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import {} from "lucide-react";
import { Suspense } from "react";
import { SWRConfig } from "swr";

import Scroll from "@/components/Hook/Scroll";
import { Navbar } from "@/components/Layout";
import { SideMenuInnerPart } from "@/components/SideMenu";
import { SummarizeByYM } from "@/components/Summazize";
import { getFolderObject } from "@/features/file/io";
import { Spinner } from "@/park-ui/components/spinner";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import type React from "react";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const gaId = process.env.GA_ID!;
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const folders = getFolderObject();

	return (
		<html lang="ja">
			<Scroll />
			{process.env.NODE_ENV === "production" && <GoogleAnalytics gaId={gaId} />}

			<body>
				<Stack
					className={css({
						bgColor: "neutral.100",
						fontSize: { sm: "1rem", base: "0.8rem" },
					})}
					gap={0}
					h="auto"
					minH="full"
					w="full"
				>
					<Navbar folders={folders} />
					<Stack flex={1} h="auto" minH="full" w="full">
						<HStack alignItems={"space-between"}>
							<SideMenuInnerPart folders={folders} />
							<Stack
								alignItems={"center"}
								flex={1}
								h="auto"
								justifyContent={"start"}
								minH="full"
								w="full"
							>
								<HStack
									alignItems={"start"}
									className={`${css({
										"& > *": {
											wordBreak: "break-all",
											minW: 0,
										},
									})}, `}
									flex={1}
									h="100%"
									justifyContent={"center"}
									p={2}
									w="100%"
								>
									<SWRConfig
										value={{
											shouldRetryOnError: false,
										}}
									>
										<Suspense fallback={<Spinner />}>{children}</Suspense>
									</SWRConfig>
								</HStack>
							</Stack>
						</HStack>
						<HStack
							className={css({
								bg: "white",
							})}
							gap={1}
							justify={"center"}
							p={8}
							w="full"
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
