import type { PropsWithChildren } from "react";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { css } from "styled-system/css";

import * as Babel from "@babel/standalone";
import { DynamicK4aReactCode, DynamicReactCode } from "./DynamicReactCode";

export const CodeBlock = (props: PropsWithChildren<HTMLElement>) => {
	const { children, className } = props;

	const language = className?.match(/language-(\w+)/)?.[1];

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
					language={"tsx"}
					style={docco}
					className={css({ fontFamily: "monospace", margin: 0 })}
				>
					{children as string}
				</SyntaxHighlighter>
			</div>
		);
	}

	if (language === "k4aDataView") {
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
					p: 2,
				})}
			>
				<DynamicK4aReactCode transpiledCode={transpiledCode} />
			</div>
		);
	}

	return (
		<SyntaxHighlighter
			language={language}
			style={docco}
			className={css({ fontFamily: "monospace" })}
		>
			{children as string}
		</SyntaxHighlighter>
	);
};

export const Pre = ({ children }: PropsWithChildren) => {
	return <>{children}</>;
};
