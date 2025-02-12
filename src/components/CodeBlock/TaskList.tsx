"use client";

import path from "path-browserify";
import useSWR from "swr";

import { client, fetcher } from "@/app/search/hono";
import { NextLink, NextLinkButton } from "@/components/Link/NextLink";
import { Link } from "@/park-ui/components/link";
import { Spinner } from "@/park-ui/components/spinner";
import { normalizePath } from "@/utils/path";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import type { TasksResponse } from "@/app/api/[[...route]]/vault";
import type { InferResponseType } from "hono";

const tasksAPI = client.api.vault.tasks;
const tasksURL = tasksAPI.$url();

export const ReactViewTaskList = () => {
	const r = useSWR<InferResponseType<(typeof tasksAPI)["$get"]>>(
		() => [tasksURL],
		([url]) => fetcher(url),
	);

	if (r.isLoading) return <Spinner />;
	if (r.error) return "エラー";
	if (!r.data) return "データがありません";

	return <ReactViewTaskListContent tasks={r.data} />;
};

const ReactViewTaskListContent = ({ tasks }: { tasks: TasksResponse[] }) => {
	return (
		<Stack>
			{tasks.map((p, pi) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<Stack key={pi} p={0}>
					<Link asChild color={"blue.10"}>
						<NextLink href={path.join("/", normalizePath(p.path))}>
							{p.title}({p.tasks.length})
						</NextLink>
					</Link>
					{p.tasks.map((t, i) => (
						<NextLinkButton
							borderRadius={"none"}
							color={"inherit"}
							fontSize={"inherit"}
							fontWeight={"normal"}
							height="auto"
							href={path.join("/", normalizePath(p.path), `#${t.id}`)}
							justifyContent={"start"}
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							size="sm"
							textDecoration={"none"}
							variant={"ghost"}
						>
							<span
								className={css({
									textWrap: "wrap",
								})}
							>
								<input checked={t.task === "x"} readOnly type="checkbox" />{" "}
								{t.text}
							</span>
						</NextLinkButton>
					))}
				</Stack>
			))}
		</Stack>
	);
};
