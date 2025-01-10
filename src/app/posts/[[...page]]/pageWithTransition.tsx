"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export const PageWithTransition = ({ children }: PropsWithChildren) => {
	return (
		<motion.div
			initial={{ y: 10, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ ease: "easeInOut", duration: 0.25 }}
		>
			{children}
		</motion.div>
	);
};
