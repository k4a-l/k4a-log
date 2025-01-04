import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { Tag } from "lucide-react";
import { css } from "styled-system/css";

export const Hashtag = ({ children }: { children: React.ReactNode }) => {
	return (
		<Button size="xs" asChild py={0} colorPalette={"red"}>
			<Link className={css({ borderWidth: 1, borderColor: "gray" })}>
				<Tag size={12} />
				{children}
			</Link>
		</Button>
	);
};
