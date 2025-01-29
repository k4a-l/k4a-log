import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

import type { PropsWithChildren } from "react";

export const ParagraphWrap = ({ children }: PropsWithChildren) => {
	return (
		<Box
			className={css({
				whiteSpace: "normal",
				display: "inline-block",
				w: "100%",
				minW: 0,
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
