import {
	MessageCircleQuestionIcon,
	NotebookIcon,
	PiggyBankIcon,
	SearchIcon,
} from "lucide-react";

import { searchPath } from "@/app/search/util";
import { NextLinkButton } from "@/components/Link/NextLink";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

export default function NotFound() {
	return (
		<>
			<HStack
				alignItems={"start"}
				className={`${css({
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}, `}
				h="100%"
				justifyContent={"center"}
				w="100%"
			>
				<Stack
					bg="white"
					maxW={"max(1000px,100%)"}
					p={4}
					rounded={"md"}
					w={"1000px"}
				>
					<HStack alignItems={"end"}>
						<h1
							className={css({
								p: 0,
								m: 0,
								lineHeight: "1",
							})}
						>
							404
						</h1>
						<span>Not Found</span>
						<PiggyBankIcon />
						<MessageCircleQuestionIcon />
					</HStack>

					<p>ページが見つかりませんでした</p>

					<HStack>
						<NextLinkButton href={"/"} variant={"subtle"}>
							<NotebookIcon />
							トップページ
						</NextLinkButton>
						<NextLinkButton href={searchPath} variant={"subtle"}>
							<SearchIcon />
							検索ページ
						</NextLinkButton>
					</HStack>
				</Stack>
			</HStack>
		</>
	);
}
