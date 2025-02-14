"use client";

import { useMemo, type PropsWithChildren } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { v4 as uuid } from "uuid";

import { Spinner } from "@/park-ui/components/spinner";
import { css } from "styled-system/css";

import { usePromise } from "./usePromise";

export const CustomSyntaxHighlighter = ({
	children,
	language,
}: PropsWithChildren<{ language: string }>) => {
	// なんか重いので...
	const id = useMemo(() => uuid(), []);
	const r = usePromise(id);

	if (r.isLoading) return <Spinner />;

	return (
		<SyntaxHighlighter
			className={css({ fontFamily: "monospace" })}
			language={language}
			style={docco}
		>
			{children as string}
		</SyntaxHighlighter>
	);
};
