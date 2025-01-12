"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";

export const PageWithTransition = ({ children }: PropsWithChildren) => {
	return (
		<motion.div
			initial={{ y: 10, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ ease: "easeInOut", duration: 0.25 }}
			className={css({ w: "full", h: "full" })}
		>
			{children}
		</motion.div>
	);
};
