import path from "path-browserify";

import { normalizePath } from "@/utils/path";

interface MyHeadProps {
	title: string;
	description: string;
	url: string;
	imagePath?: string;
	keywords: string[];
	robots?: string;
}

// https://qiita.com/tsuka-rinorino/items/3b4fb69d980cecddf512
export const MyHead = ({
	title: _title,
	description,
	url: _url,
	imagePath: _imagePath,
	keywords,
	robots,
}: MyHeadProps) => {
	const url = normalizePath(_url);
	const imagePath = path.join(
		process.env.NEXT_PUBLIC_BASE_PATH ?? "",
		_imagePath ?? "/assets/logo.png",
	);
	const title = `${_title} | k4a-log`;

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
				content="width=device-width,initial-scale=1,shrink-to-fit=no"
				name="viewport"
			/>
			<meta content={description} name="description" />
			<meta content={keywords.join(",")} name="keywords" />
			{robots ?? <meta content={robots} name="robots" />}
			{/* <!-- 設定 --> */}
			<meta
				content="telephone=no,email=no,address=no"
				name="format-detection"
			/>
			{/* <!-- SNS向け --> */}
			<meta content="website" property="og:type" />
			<meta content={title} key="title" property="og:title" />
			<meta content={description} property="og:description" />
			<meta content={url} property="og:url" />
			<meta content={imagePath} property="og:image" />
			<meta content="EXP Map" property="og:site_name" />
			<meta content={"summary"} name="twitter:card" />
			<meta content={imagePath} name="twitter:image" />
			{/* <meta name="twitter:title" content={title} /> */}
			{/* <meta name="twitter:description" content={description} /> */}
			{/* <meta name="twitter:image" content={imagePath} /> */}
			{/* TODO: 設定 */}
			{/* <meta name="twitter:site" content="@{{ twitter id }}" />
				<meta name="twitter:creator" content="@{{ twitter id }}" /> */}
			{/* <!-- アイコン関係 --> */}
			<link href="/favicon.ico" rel="icon" type="shortcut icon" />
			<link
				href="/assets/common/apple-touch-icon.png"
				rel="apple-touch-icon"
				sizes="180x180"
			/>
			{/* <!-- Windows --> */}
			{/* TODO: 設定 */}
			{/* <meta name="msapplication-config" content="/browserconfig.xml" /> */}
			{/* <!-- Android --> */}
			{/* TODO: 設定 */}
			{/* <meta name="theme-color" content="{{ color }}" /> */}
			<link href={url} rel="canonical" />
			{/* </Head> */}
		</>
	);
};
