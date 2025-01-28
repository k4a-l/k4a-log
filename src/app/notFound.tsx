import { searchPath } from "@/app/search/util";
import { NextLinkButton } from "@/components/Link/NextLink";
import {
	MessageCircleQuestionIcon,
	NotebookIcon,
	PiggyBankIcon,
	SearchIcon,
} from "lucide-react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

export default function NotFound() {
	return (
		<>
			<HStack
				justifyContent={"center"}
				alignItems={"start"}
				w="100%"
				className={`${css({
					fontSize: { sm: "1em", base: "0.8em" },
					"& > *": {
						wordBreak: "break-all",
						minW: 0,
					},
				})}, `}
				h="100%"
			>
				<Stack
					bg="white"
					p={4}
					rounded={"md"}
					maxW={"max(1000px,100%)"}
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
							ポスト検索ページ
						</NextLinkButton>
					</HStack>
				</Stack>
			</HStack>
		</>
	);
}
