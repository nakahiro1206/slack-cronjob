'use client';

import { Main } from "@/components/main/Main";
import { trpc } from "@/lib/trpc/client";
import { Login } from "@/components/login/Login";

function Home() {
  return (
    <Login>
      <Main />
    </Login>
  )
}

export default trpc.withTRPC(Home);