import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

export const ParagraphWrap = ({ children }: PropsWithChildren) => {
	return (
		<Box
			className={css({
				whiteSpace: "normal",
				display: "inline-block",
				"& > img,video": {
					display: "inline",
					verticalAlign: "top",
					gap: 0,
				},
			})}
		>
			{children}
		</Box>
	);
};
