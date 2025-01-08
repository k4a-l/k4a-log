import Scroll from "@/components/Hook/Scroll";
import "../../styled-system/styles.css";
import "./index.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<Scroll />
			<body>{children}</body>
		</html>
	);
}
