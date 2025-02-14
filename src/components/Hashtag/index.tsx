import { Hash } from "lucide-react";

import { getSearchPath } from "@/app/search/util";
import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { css } from "styled-system/css";

import type { AnchorHTMLAttributes } from "react";

export const Hashtag = ({
	children,
	href,
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
	return (
		<Button
			asChild
			colorPalette={"blue"}
			fontSize={{ base: "0.5em", sm: "0.8em" }}
			px={"0.8em"}
			py={1}
			size={{ base: "xs", sm: "sm" }}
			variant={"subtle"}
		>
			<Link
				className={css({
					borderWidth: 1,
					borderColor: "gray",
					height: "1.5em",
					gap: 0,
					display: "inline-flex !important",
				})}
				href={getSearchPath({ tag: href, query: "" })}
			>
				<Hash
					className={css({
						w: "0.8em",
						h: "0.8em",
					})}
				/>
				{children}
			</Link>
		</Button>
	);
};
