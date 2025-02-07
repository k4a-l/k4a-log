import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		silent: false,
		env: dotenv.config({ path: ".env" }).parsed,
	},
});
