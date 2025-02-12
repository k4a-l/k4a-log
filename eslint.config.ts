import { FlatCompat } from "@eslint/eslintrc";
import biome from "eslint-config-biome";

import type { Linter } from "eslint";

const compat = new FlatCompat();

// https://github.com/biomejs/biome/issues/3177 の対応が終わったら消す
export default [
	{ ignores: ["src/park-ui", "src/types"] },
	...compat.extends("next/core-web-vitals"),
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		rules: {
			"@next/next/no-img-element": "off",
			"react/display-name": "off",
			"import/order": [
				"warn",
				{
					alphabetize: {
						caseInsensitive: true,
						order: "asc",
					},
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index",
						"object",
						"type",
					],
					"newlines-between": "always",
					pathGroupsExcludedImportTypes: ["builtin"],
				},
			],
			"react/jsx-sort-props": "warn",
		},
	},
	biome,
] satisfies Linter.Config[];
