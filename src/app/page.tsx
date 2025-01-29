import path from "node:path";
import { postsDirPath } from "@/features/metadata/constant";
import { redirect } from "next/navigation";

export default async function Page() {
	redirect(path.join("/", postsDirPath));
}
