import type { NextConfig } from "next";

const baseUrl =
	process.env.VERCEL_ENV === "production"
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: "http://localhost:3000";

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (
		config,
		{ buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
	) => {
		config.resolve.fallback = { fs: false };

		return config;
	},
	env: {
		URL: baseUrl,
		API_ENDPOINT: `${baseUrl}/api`,
		RUNTIME: "Next.js",
	},
};

export default nextConfig;
