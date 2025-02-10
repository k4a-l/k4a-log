"use client";
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { css } from "styled-system/css";
import { IconButton } from "@/park-ui/components/icon-button";
import { LinkIcon, XIcon } from "lucide-react";
import { HStack, Stack } from "styled-system/jsx";

export default function FloatingPopup({ children }: PropsWithChildren) {
	const [isBottomVisible, setIsBottomVisible] = useState(false);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) {
					return setIsBottomVisible(false);
				}

				if (entry.isIntersecting) {
					setIsBottomVisible(true);
				} else {
					setIsBottomVisible(false);
					setIsPopupOpen(false);
				}
			},
			{ threshold: 0.1 },
		);

		if (bottomRef.current) {
			observer.observe(bottomRef.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				setIsPopupOpen(false);
			}
		};

		if (isPopupOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isPopupOpen]);

	return (
		<>
			{/* 右下のフロートボタン */}
			{!isBottomVisible && !isPopupOpen && (
				<motion.div
					className={css({
						position: "fixed",
						bottom: 2,
						right: 2,
						zIndex: "popover",
					})}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
				>
					<IconButton
						variant={"subtle"}
						bg="white"
						colorPalette={"white"}
						onClick={() => setIsPopupOpen(true)}
						shadow={"md"}
						size={{ md: "md", base: "sm" }}
					>
						<LinkIcon />
					</IconButton>
				</motion.div>
			)}

			{/* フロートポップアップ */}
			{!isBottomVisible && isPopupOpen && (
				<motion.div
					ref={popupRef}
					className={css({
						position: "fixed",
						bottom: 2,
						right: 2,
						background: "white",
						boxShadow: "lg",
						rounded: "xl",
						overflow: "scroll",
						h: "calc(100% - 32px - 16px - 4px)",
						zIndex: "popover",
					})}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
				>
					<HStack position={"sticky"} top={0} justifyContent={"end"}>
						<IconButton
							onClick={() => setIsPopupOpen(false)}
							size="sm"
							variant={"ghost"}
						>
							<XIcon />
						</IconButton>
					</HStack>
					{children}
				</motion.div>
			)}

			{/* 通常の最下部コンテンツ */}
			<Stack ref={bottomRef}>{children}</Stack>
		</>
	);
}
