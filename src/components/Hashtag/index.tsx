import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { Hash } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { css } from "styled-system/css";

export const Hashtag = ({
	children,
	href,
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	return (
		<Button
			size="sm"
			asChild
			py={1}
			px={2}
			colorPalette={"blue"}
			variant={"subtle"}
		>
			<Link
				className={css({
					borderWidth: 1,
					borderColor: "gray",
					height: "1.5em",
					gap: 0,
				})}
				href={`/search?query=${encodeURIComponent(`#${href ?? ""}`)}`}
			>
				<Hash size={"1em"} />
				{children}
			</Link>
		</Button>
	);
};
