"use client";

import type {} from "mdast";
import {} from "react";

import { useEffect } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import * as tocbot from "tocbot";

export const TableOfContents = () => {
	useEffect(() => {
		tocbot.init({
			tocSelector: ".side-toc",
			contentSelector: ".md-post-container", // 目次を抽出したい要素のクラス名
			headingSelector: "h1, h2, h3, h5, h6",
			scrollSmoothOffset: -60,
			headingsOffset: 60,
			scrollSmoothDuration: 300,
		});
		return () => tocbot.destroy();
	}, []);

	return <div className="side-toc" />;
};

export const SideTableOfContents = () => {
	return (
		<>
			<Stack
				w={1260 - 1000 - 20}
				display={{
					xl: "flex",
					base: "none",
				}}
				// bg="whitesmoke"
				top={4}
				p={0}
				position={"sticky"}
				maxHeight="100vh"
				overflowX={"hidden"}
				overflowY={"auto"}
				className={css({
					fontSize: "0.9em",
					"& .toc-list": {
						px: 0,
						my: 0,
					},
					"& .toc-link": {
						rounded: "md",
						color: "gray.10",
						textDecoration: "none",
						transition: "color 0.2s",
						py: 1,
						px: 2,
						display: "block",
					},
					"& .toc-list .is-collapsible": {},
					"& .is-collapsible .toc-link": {
						ml: "1em",
					},
					"& .toc-link:hover": {
						color: "gray.10",
						bg: "gray.4",
					},
					"& .toc-list-item": {
						listStyle: "none",
						p: 0,
					},
					"& .is-active-link": {
						color: "gray.11",
						bg: "gray.5",
						fontWeight: "bold",
					},
				})}
			>
				<TableOfContents />
			</Stack>
		</>
	);
};
