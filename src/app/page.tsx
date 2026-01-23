"use client";

import { Login } from "@/components/login/Login";
import { Main } from "@/components/main";
import { trpc } from "@/lib/trpc/client";

function Home() {
	return (
		<Login>
			<Main />
		</Login>
	);
}

export default trpc.withTRPC(Home);
