import * as Babel from "@babel/standalone";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { css } from "styled-system/css";

import { DynamicK4aReactCode, DynamicReactCode } from "./DynamicReactCode";

import type { MetaProps } from "@/features/metadata/type";
import type { PropsWithChildren } from "react";

export const CodeBlock = (
	props: PropsWithChildren<HTMLElement & MetaProps>,
) => {
	const { children, className, vault, note } = props;

	const language = className?.match(/language-(\w+)/)?.[1];

	if (!language) {
		return (
			<code
				className={css({
					bg: "gray.3",
					":not(pre) > &": {
						p: 1,
						borderRadius: "0.2em",
					},
					"pre > &": {
						my: 2,
						color: "gray.12",
						p: 2,
						display: "block",
						w: "auto",
						overflow: "auto",
					},
				})}
			>
				{children}
			</code>
		);
	}

	if (language === "react") {
		const transpiledCode =
			Babel.transform(String(children), {
				presets: ["react"],
			}).code ?? "";

		return (
			<div
				className={css({
					bg: "white",
					boxShadow: "xs",
					borderRadius: "sm",
				})}
			>
				<div
					className={css({
						p: 2,
					})}
				>
					<DynamicReactCode transpiledCode={transpiledCode} />
				</div>
				<SyntaxHighlighter
					className={css({ fontFamily: "monospace", margin: 0 })}
					language={"tsx"}
					style={docco}
				>
					{children as string}
				</SyntaxHighlighter>
			</div>
		);
	}

	if (language === "reactView") {
		return (
			<div
				className={css({
					bg: "white",
					boxShadow: "xs",
					borderRadius: "sm",
					p: 2,
				})}
			>
				<DynamicK4aReactCode
					markdown={children as string}
					note={note}
					vault={vault}
				/>
			</div>
		);
	}

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

export const Pre = ({ children }: PropsWithChildren) => {
	return <pre>{children}</pre>;
};
