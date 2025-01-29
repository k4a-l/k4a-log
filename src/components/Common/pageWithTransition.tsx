"use client";

import { motion } from "framer-motion";

import { css } from "styled-system/css";

import type { PropsWithChildren } from "react";

export const PageWithTransition = ({ children }: PropsWithChildren) => {
	return (
		<motion.div
			animate={{ y: 0, opacity: 1 }}
			className={css({ w: "full", h: "full" })}
			initial={{ y: 10, opacity: 0 }}
			transition={{ ease: "easeInOut", duration: 0.25 }}
		>
			{children}
		</motion.div>
	);
};
