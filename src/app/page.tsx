import { Spinner } from "@/park-ui/components/spinner";
import { Suspense } from "react";
import NotePage from "@/app/notes/[[...page]]/PagePresentation";

export default async function Page() {
	return (
		<Suspense fallback={<Spinner />}>
			<NotePage />
		</Suspense>
	);
}
