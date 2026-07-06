import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The generated SDK ships as TypeScript source from the workspace, so let
	// Next transpile it instead of expecting a pre-built package.
	transpilePackages: ["@node-course/api-sdk"],
};

export default nextConfig;
