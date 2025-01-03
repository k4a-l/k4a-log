import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
	preflight: true,
	presets: [
		createPreset({
			accentColor: "blue",
			grayColor: "sand",
			borderRadius: "xl",
		}),
	],
	include: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
	jsxFramework: "react", // or 'solid' or 'vue'
	outdir: "styled-system",
});
