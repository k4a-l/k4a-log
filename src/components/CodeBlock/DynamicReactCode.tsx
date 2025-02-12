"use client";

import {} from "@/components/Link/NextLink";
import * as Babel from "@babel/standalone";
import React, { Suspense, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import {} from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import {} from "styled-system/jsx";
import { Spinner } from "@/park-ui/components/spinner";

import { ReactViewTaskList } from "./TaskList";

export const DynamicReactCode = ({ markdown }: { markdown: string }) => {
	const Component = executeComponent(
		Babel.transform(String(markdown), {
			presets: ["react"],
		}).code ?? "",
	);

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
