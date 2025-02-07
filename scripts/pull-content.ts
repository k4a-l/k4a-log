import { notesDirPath } from "@/features/metadata/constant";

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const contentRepoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/k4a-l/k4a-log-content.git`;

const workDir = path.resolve(__dirname, "../.cloned-repo");
const targetDir = path.resolve(__dirname, `../assets/${notesDirPath}`);

// 前処理
// workDirが存在していたら削除
if (fs.existsSync(workDir)) {
	fs.rmSync(workDir, { recursive: true, force: true });
	console.log(`deleted ${workDir}`);
}

// targetDirの中身を'tests'を除いて全て削除
if (fs.existsSync(targetDir)) {
	const files = fs.readdirSync(targetDir);
	for (const file of files) {
		if (file === "tests") continue;
		if (file === "Draft.md") continue;
		fs.rmSync(path.join(targetDir, file), { recursive: true, force: true });
	}
	console.log(`deleted all files in ${targetDir}`);
}

try {
	execSync(
		`git -c core.longpaths=true clone --depth=1 ${contentRepoUrl} ${workDir}`,
		{
			stdio: "inherit",
		},
	);
	console.log("Content repository updated successfully.");
} catch (error) {
	console.error("Error updating content repository:", error);
	process.exit(1);
}

const copyFiles = (srcPath: string, destPath: string) => {
	const files = fs.readdirSync(srcPath, { withFileTypes: true });
	for (const file of files) {
		const srcFullPath = path.join(srcPath, file.name);
		const destFullPath = path.join(destPath, file.name);
		if (file.isDirectory()) {
			if (file.name === ".git") continue;
			copyFiles(srcFullPath, destFullPath);
		} else {
			fs.cpSync(srcFullPath, destFullPath, { recursive: true });
		}
	}
};

copyFiles(workDir, targetDir);
console.log(`copied ${workDir} to ${targetDir}`);

fs.rmSync(workDir, { recursive: true, force: true });
console.log(`deleted ${workDir}`);
