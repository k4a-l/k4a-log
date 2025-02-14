import dynamic from "next/dynamic";
import { Suspense, type PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Spinner } from "@/park-ui/components/spinner";
import { css } from "styled-system/css";

import { DynamicK4aReactCode, DynamicReactCode } from "./DynamicReactCode";
import { Mermaid } from "./Mermaid";
const CustomSyntaxHighlighter = dynamic(() =>
	import("./SyntaxHighlighter").then((mod) => mod.CustomSyntaxHighlighter),
);

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
				<CustomSyntaxHighlighter language={"tsx"}>
					{children as string}
				</CustomSyntaxHighlighter>
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
						<CustomSyntaxHighlighter language={language}>
							{children as string}
						</CustomSyntaxHighlighter>
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
		<CustomSyntaxHighlighter language={language}>
			{children as string}
		</CustomSyntaxHighlighter>
	);
};

export const Pre = ({ children }: PropsWithChildren) => {
	return <pre>{children}</pre>;
};
