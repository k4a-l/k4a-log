"use client";
import { pageViewLength } from "@/app/api/[[...route]]/search/constant";
import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import {} from "@/park-ui/components/select";
import { Spinner } from "@/park-ui/components/spinner";
import { normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

import { type SearchQuery, getSearchPath } from "./util";

import type { useHonoQuery } from "./hono";

export const SearchResult = ({
	data,
	error,
	isLoading,
	page,
	searchQuery,
}: ReturnType<typeof useHonoQuery<"search">> & {
	page: number;
	searchQuery: SearchQuery;
}) => {
	if (error) return <div>データの取得でエラーが発生しました</div>;
	if (isLoading)
		return (
			<HStack justifyContent={"center"} p={4}>
				<Spinner /> 取得中
			</HStack>
		);
	if (!data) return <div>データが取得できませんでした</div>;
	if (data.notes.length === 0) return <div>検索結果がありません</div>;

	return (
		<>
			<Stack w="100%">
				<HStack
					display="grid"
					flexDir={{ base: "column", sm: "row" }}
					flexWrap={"wrap"}
					gap="10px"
					gridTemplateColumns={"repeat(auto-fill, minmax(200px, 1fr))"}
				>
					{data.notes.map((r) => (
						<Link
							asChild
							aspectRatio="1 / 1"
							boxSizing={"border-box"}
							key={r.path}
							overflow={"hidden"}
							textDecoration="none"
						>
							<NextLink href={normalizePath(r.path)}>
								<Stack
									boxShadow={"sm"}
									className={css({
										bg: "white",
										color: "black",
										transition: "all 0.1s ease-in-out",
										_hover: {
											bg: "slate.100",
											transform: "translateY(3px)",
										},
									})}
									h="100%"
									p={2}
									rounded={"xs"}
									w="100%"
								>
									<Stack gap={0} overflow={"hidden"}>
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
												alt={r.thumbnailPath}
												className={css({
													// alt用
													fontSize: "0.5em",
												})}
												src={r.thumbnailPath}
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
					allNumber={data.allNumber}
					page={page}
					pageViewLength={pageViewLength}
					searchQuery={searchQuery}
				/>
			) : null}
		</>
	);
};

const Pagination = (props: {
	page: number;
	allNumber: number;
	pageViewLength: number;
	searchQuery: SearchQuery;
}) => {
	const { page, allNumber, pageViewLength, searchQuery } = props;
	const maxPage = Math.ceil(allNumber / pageViewLength);
	return (
		<HStack justifyContent={"space-between"}>
			{/* ページネーション実装 */}
			<NextLinkButton
				disabled={page < 1}
				href={getSearchPath({ ...searchQuery, page: page - 1 })}
				size={"sm"}
			>
				前へ
			</NextLinkButton>
			{page + 1} / {maxPage}
			<NextLinkButton
				disabled={page >= maxPage - 1}
				href={getSearchPath({
					...searchQuery,
					page: page + 1,
					query: "",
					tag: "",
				})}
				size={"sm"}
			>
				次へ
			</NextLinkButton>
		</HStack>
	);
};
