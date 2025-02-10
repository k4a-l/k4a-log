"use client";
import {} from "@/components/Link/NextLink";
import React, { Suspense, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import {} from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import {} from "styled-system/jsx";
import { ReactViewTaskList } from "./TaskList";
import { Spinner } from "@/park-ui/components/spinner";

export const DynamicReactCode = ({
	transpiledCode,
}: { transpiledCode: string }) => {
	const Component = executeComponent(transpiledCode);
	return <Component />;
};

// JSX を動的に評価してコンポーネントを作成
export const executeComponent = (jsxString: string): React.FC => {
	const Component = () => {
		const componentFunction = new Function(
			"React",
			"useState",
			`return ${jsxString}`,
		);

		return componentFunction(React, useState)();
	};

	return Component;
};

export const DynamicK4aReactCode = ({ markdown }: { markdown: string }) => {
	return (
		<Suspense fallback={<Spinner />}>
			<ReactMarkdown
				components={
					{
						tasklist: ReactViewTaskList,
					} as Components
				}
				rehypePlugins={[rehypeRaw]}
				remarkPlugins={[
					remarkGfm,
					[remarkRehype, { allowDangerousHtml: true }],
				]}
			>
				{markdown}
			</ReactMarkdown>
		</Suspense>
	);
};
