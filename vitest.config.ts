import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		env: loadEnv(mode, process.cwd(), ""),
		onConsoleLog(log: string, type: "stdout" | "stderr"): false | void {
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
