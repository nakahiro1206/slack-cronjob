'use client';

import { Main } from "@/components/main/Main";
import { trpc } from "@/lib/trpc/client";

function Home() {
  return <Main />;
}

export default trpc.withTRPC(Home);