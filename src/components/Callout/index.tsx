"use client";

import { type PropsWithChildren, useState } from "react";

export const Callout = ({
	children,
	...props
}: PropsWithChildren<{ "data-expandable"?: "true" | "false" }>) => {
	const { "data-expandable": expandableStr } = props;
	const expandable = expandableStr === "true";

	const [isExpanded, setIsExpanded] = useState(!expandable);

	return (
		<blockquote
			{...props}
			data-expanded={String(isExpanded)}
			onClick={!expandable ? undefined : () => setIsExpanded(!isExpanded)}
		>
			{children}
		</blockquote>
	);
};
