"use client";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

type EmbeddedCardProps = {
	url: string;
	title: string;
	description?: string;
	website: string;
	favicons: string[];
	banner?: string;
};

export const EmbeddedCardPresentational = ({
	url,
	title,
	description,
	website,
	banner,
	favicons,
}: EmbeddedCardProps) => {
	const urlObj = new URL(website);
	const favicon = favicons[0];

	return (
		<Container>
			<a
				className={css({
					display: "flex",
					justifyContent: "space-between",
					color: "inherit",
					textDecoration: "none",
				})}
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Stack
					className={css({
						flexShrink: 1,
						flexGrow: 0,
						w: "auto",
						overflow: "hidden",
					})}
					justifyContent={"space-between"}
					p={2}
				>
					<span
						className={css({
							fontWeight: "bold",
						})}
					>
						{title}
					</span>
					<span
						className={css({
							w: "auto",
							flexShrink: 1,
							fontSize: "0.8em",
							color: "gray.10",
							// textWrap: "nowrap",
							overflow: "hidden",
						})}
					>
						{description}
					</span>
					<HStack
						className={css({
							flexShrink: 0,
							flexGrow: 1,
						})}
					>
						{favicon ? (
							<img
								alt={title}
								className={css({
									objectFit: "cover",
									height: "14px",
									maxWidth: "14px",
								})}
								src={favicon}
							/>
						) : null}
						{urlObj.hostname}
					</HStack>
				</Stack>
				<img
					alt={title}
					className={css({
						objectFit: "cover",
						height: "120px",
						maxWidth: "230px",
					})}
					src={banner}
				/>
			</a>
		</Container>
	);
};

export const EmbeddedCardError = ({ url }: { url: string }) => {
	return (
		<Container>
			<a
				className={css({
					display: "flex",
					p: 2,
					alignItems: "center",
					color: "inherit",
					textDecoration: "none",
				})}
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{url}
			</a>
		</Container>
	);
};

const Container = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className={css({
				borderRadius: "md",
				borderWidth: 1,
				borderColor: "gray.3",
				w: "full",
				display: "inline-block",
				maxH: "120px",
				overflow: "hidden",
				_hover: {
					backgroundColor: "gray.2",
				},
			})}
		>
			{children}
		</div>
	);
};
