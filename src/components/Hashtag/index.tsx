import { getSearchPath } from "@/app/search/util";
import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { Hash } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { css } from "styled-system/css";

export const Hashtag = ({
	children,
	href,
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
	return (
		<Button
			size={{ base: "xs", sm: "sm" }}
			asChild
			py={1}
			px={"0.8em"}
			colorPalette={"blue"}
			variant={"subtle"}
			fontSize={{ base: "0.5em", sm: "0.8em" }}
		>
			<Link
				className={css({
					borderWidth: 1,
					borderColor: "gray",
					height: "1.5em",
					gap: 0,
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
