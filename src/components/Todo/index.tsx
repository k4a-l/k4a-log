import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";

export const TodoComponent = ({ children }: PropsWithChildren) => {
	return (
		<span
			className={css({
				fontWeight: "bold",
				fontSize: "xl",
				bg: "red",
				color: "white",
				px: 2,
				py: 1,
			})}
		>
			TODO: {children}
		</span>
	);
};
