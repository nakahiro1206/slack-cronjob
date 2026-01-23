import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		env: loadEnv(mode, process.cwd(), ""),
		onConsoleLog(log: string, type: "stdout" | "stderr"): false | undefined {
			console.log("log in test: ", log);
			if (log === "message from third party library" && type === "stdout") {
				return false;
			}
		},

		projects: [
			// npm run test --project unit/integration
			{
				test: {
					name: "unit",
					include: ["**/*.unit.test.ts"],
				},
			},
			{
				test: {
					name: "integration",
					include: ["**/*.integration.test.ts"],
				},
			},
		],
	},
}));
