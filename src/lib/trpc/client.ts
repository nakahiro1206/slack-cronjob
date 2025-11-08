import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/lib/trpc/routers/_app";

const isDev = process.env.NODE_ENV === "development";

export const trpcReact = createTRPCReact<AppRouter>();

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		return {
			links: [
				httpBatchLink({
					url: isDev
						? "http://localhost:3000/api/trpc"
						: "https://slack-cronjob.vercel.app/api/trpc",
					transformer: superjson,
				}),
			],
		};
	},
	ssr: false,
	transformer: superjson,
});
