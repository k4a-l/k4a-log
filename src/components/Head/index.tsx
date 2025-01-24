import { normalizePath } from "@/utils/path";
import path from "path-browserify";

interface MyHeadProps {
	title: string;
	description: string;
	url: string;
	imagePath?: string;
	keywords: string[];
}

// https://qiita.com/tsuka-rinorino/items/3b4fb69d980cecddf512
export const MyHead = ({
	title,
	description,
	url: _url,
	imagePath: _imagePath,
	keywords,
}: MyHeadProps) => {
	const url = normalizePath(_url);
	const imagePath = path.join(
		process.env.NEXT_PUBLIC_BASE_PATH ?? "",
		_imagePath ?? "/assets/logo.png",
	);

	return (
		<>
			{/* <Head
			//  prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article:http://ogp.me/ns/article#"
			> */}
			<title>{title}</title>
			<meta charSet="utf-8" />

			{/* <!-- safari --> */}
			{/* <link
					rel="mask-icon"
					color="{{ カラーコード }}"
					href="/mask-icon.svg"
				/> */}
			{/* <!-- 一般的なタグ --> */}
			<meta
				name="viewport"
				content="width=device-width,initial-scale=1,shrink-to-fit=no"
			/>
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords.join(",")} />
			{/* <!-- 設定 --> */}
			<meta
				name="format-detection"
				content="telephone=no,email=no,address=no"
			/>
			{/* <!-- SNS向け --> */}
			<meta property="og:type" content="website" />
			<meta property="og:title" content={title} key="title" />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={imagePath} />
			<meta property="og:site_name" content="EXP Map" />
			<meta name="twitter:card" content={"summary"} />
			<meta name="twitter:image" content={imagePath} />
			{/* <meta name="twitter:title" content={title} /> */}
			{/* <meta name="twitter:description" content={description} /> */}
			{/* <meta name="twitter:image" content={imagePath} /> */}
			{/* TODO: 設定 */}
			{/* <meta name="twitter:site" content="@{{ twitter id }}" />
				<meta name="twitter:creator" content="@{{ twitter id }}" /> */}
			{/* <!-- アイコン関係 --> */}
			<link rel="icon" type="shortcut icon" href="/favicon.ico" />
			<link
				rel="apple-touch-icon"
				sizes="180x180"
				href="/assets/common/apple-touch-icon.png"
			/>
			{/* <!-- Windows --> */}
			{/* TODO: 設定 */}
			{/* <meta name="msapplication-config" content="/browserconfig.xml" /> */}
			{/* <!-- Android --> */}
			{/* TODO: 設定 */}
			{/* <meta name="theme-color" content="{{ color }}" /> */}
			<link rel="canonical" href={url} />
			{/* </Head> */}
		</>
	);
};
