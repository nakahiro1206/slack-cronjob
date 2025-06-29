import type { AppRouter } from "@/lib/trpc/routers/_app";
import { createTRPCReact } from "@trpc/react-query";
import { createTRPCNext } from "@trpc/next";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const isDev = process.env.NODE_ENV === "development";

export const trpcReact = createTRPCReact<AppRouter>();

export const trpc = createTRPCNext<AppRouter>({
    config(opts) {
        return {
            links: [
                httpBatchLink({
                    url: isDev ? 'http://localhost:3000/api/trpc' : 'https://slack-cronjob.vercel.app/api/trpc',
                    transformer: superjson,
                }),
            ],
        };
    },
    ssr: false,
    transformer: superjson,
});