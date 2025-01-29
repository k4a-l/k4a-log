import path from "node:path";

import { redirect } from "next/navigation";

import { notesDirPath } from "@/features/metadata/constant";

export default async function Page() {
	redirect(path.join("/", notesDirPath));
}
