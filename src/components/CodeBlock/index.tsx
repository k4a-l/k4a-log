import { Suspense, type PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Spinner } from "@/park-ui/components/spinner";
import { css } from "styled-system/css";

import { DynamicK4aReactCode, DynamicReactCode } from "./DynamicReactCode";
import { Mermaid } from "./Mermaid";

export const CodeBlock = (props: PropsWithChildren<HTMLElement>) => {
	const { children, className } = props;

	const language = className?.match(/language-(\w+)/)?.[1];

	if (!language) {
		return (
			<code
				className={css({
					bg: "gray.3",
					":not(pre) > &": {
						p: "0.2em",
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
					<ErrorBoundary fallback={"コンパイルエラー"}>
						<Suspense fallback={<Spinner />}>
							<DynamicReactCode markdown={String(children)} />
						</Suspense>
					</ErrorBoundary>
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
				<ErrorBoundary
					fallback={
						<SyntaxHighlighter
							className={css({ fontFamily: "monospace" })}
							language={language}
							style={docco}
						>
							{children as string}
						</SyntaxHighlighter>
					}
				>
					<DynamicK4aReactCode markdown={children as string} />
				</ErrorBoundary>
			</div>
		);
	}

	if (language === "mermaid") {
		return <Mermaid code={children as string} />;
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
