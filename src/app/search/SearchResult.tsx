"use client";
import { pageViewLength } from "@/app/api/[[...route]]/search/constant";
import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import {} from "@/park-ui/components/select";
import { Spinner } from "@/park-ui/components/spinner";
import { normalizePath } from "@/utils/path";
import {} from "lucide-react";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";
import type { useHonoQuery } from "./hono";
import { getSearchPath } from "./util";

export const SearchResult = ({
	data,
	error,
	isLoading,
	page,
}: ReturnType<typeof useHonoQuery<"search">> & { page: number }) => {
	if (error) return <div>データの取得でエラーが発生しました</div>;
	if (isLoading)
		return (
			<HStack p={4} justifyContent={"center"}>
				<Spinner /> 取得中
			</HStack>
		);
	if (!data) return <div>データが取得できませんでした</div>;
	if (data.notes.length === 0) return <div>検索結果がありません</div>;

	return (
		<>
			<Stack w="100%">
				<HStack
					flexWrap={"wrap"}
					flexDir={{ base: "column", sm: "row" }}
					display="grid"
					gridTemplateColumns={"repeat(auto-fill, minmax(200px, 1fr))"}
					gap="10px"
				>
					{data.notes.map((r) => (
						<Link
							asChild
							key={r.path}
							aspectRatio="1 / 1"
							boxSizing={"border-box"}
							textDecoration="none"
							overflow={"hidden"}
						>
							<NextLink href={normalizePath(r.path)}>
								<Stack
									w="100%"
									h="100%"
									boxShadow={"sm"}
									rounded={"xs"}
									p={2}
									className={css({
										bg: "white",
										color: "black",
										transition: "all 0.1s ease-in-out",
										_hover: {
											bg: "slate.100",
											transform: "translateY(3px)",
										},
									})}
								>
									<Stack overflow={"hidden"} gap={0}>
										<span
											className={css({
												fontSize: "xs",
												opacity: 0.7,
											})}
										>
											{r.created ? r.created : "作成日不明"}
										</span>
										<span
											className={css({
												w: "100%",
												wordBreak: "break-all",
												whiteSpace: "wrap",
											})}
										>
											{r.title}
										</span>

										{r.thumbnailPath ? (
											<img
												src={r.thumbnailPath}
												alt={r.thumbnailPath}
												className={css({
													// alt用
													fontSize: "0.5em",
												})}
											/>
										) : (
											<span
												className={css({
													py: 2,
													fontSize: "0.8em",
													fontWeight: "normal",
													color: "gray.10",
												})}
											>
												{r.description}
											</span>
										)}
									</Stack>
								</Stack>
							</NextLink>
						</Link>
					))}
				</HStack>
			</Stack>
			{data.allNumber > pageViewLength ? (
				<Pagination
					page={page}
					allNumber={data.allNumber}
					pageViewLength={pageViewLength}
				/>
			) : null}
		</>
	);
};

const Pagination = (props: {
	page: number;
	allNumber: number;
	pageViewLength: number;
}) => {
	const { page, allNumber, pageViewLength } = props;
	const maxPage = Math.ceil(allNumber / pageViewLength);
	return (
		<HStack justifyContent={"space-between"}>
			{/* ページネーション実装 */}
			<NextLinkButton
				size={"sm"}
				disabled={page < 1}
				href={getSearchPath({ page: page - 1, query: "", tag: "" })}
			>
				前へ
			</NextLinkButton>
			{page + 1} / {maxPage}
			<NextLinkButton
				size={"sm"}
				disabled={page >= maxPage - 1}
				href={getSearchPath({ page: page + 1, query: "", tag: "" })}
			>
				次へ
			</NextLinkButton>
		</HStack>
	);
};
