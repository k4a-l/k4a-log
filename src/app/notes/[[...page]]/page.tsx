import { Suspense } from "react";

import { Spinner } from "@/park-ui/components/spinner";

import NotePage from "./PagePresentation";

export const revalidate = 600; // 10分ごとに再検証する

type Params = Promise<{ page: string[] | undefined }>;

type Props = { params: Params };

export default async function Page({ params }: Props) {
	// 生の値取得→noteDirはついてない
	const pathsFromParams = (await params).page;

	return (
		<Suspense fallback={<Spinner />}>
			<NotePage page={pathsFromParams} />
		</Suspense>
	);
}
