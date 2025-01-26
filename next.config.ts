import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		config.resolve.fallback = { fs: false };

		return config;
	},
	outputFileTracingExcludes: {
		"*": ["cloned-rep", "assets", "public"],
	},
};

export default nextConfig;
