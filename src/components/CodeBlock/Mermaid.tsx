"use client";

import mermaid from "mermaid";
import React from "react";

type Props = {
	code: string;
};

export const Mermaid: React.FC<Props> = (props) => {
	const { code } = props;
	const outputRef = React.useRef<HTMLDivElement>(null);

	const render = React.useCallback(async () => {
		if (outputRef.current && code) {
			try {
				// ① 一意な ID を指定する必要あり
				const { svg } = await mermaid.render(`m${crypto.randomUUID()}`, code);
				outputRef.current.innerHTML = svg;
			} catch (error) {
				console.error(error);
				outputRef.current.innerHTML = "Invalid syntax";
			}
		}
	}, [code]);

	React.useEffect(() => {
		render();
	}, [render]);

	return code ? (
		<div className="mermaid-container" style={{ backgroundColor: "#fff" }}>
			<div ref={outputRef} />
		</div>
	) : null;
};
