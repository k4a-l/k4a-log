import path from "node:path";
import { postDirPath } from "@/constants/path";
import { redirect } from "next/navigation";

export default async function Page() {
	redirect(path.join(postDirPath));
}
