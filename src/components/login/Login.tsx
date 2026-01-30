import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export const Login = ({ children }: { children: React.ReactNode }) => {
	const emailRef = useRef<HTMLInputElement>(null);
	const {
		mutate: login,
		isPending: isLoginPending,
		error: loginError,
	} = trpc.auth.login.useMutation();
	const [user, setUser] = useState<string | null>(null);

	useEffect(() => {
		if (loginError) {
			toast.error(loginError.message);
		}
	}, [loginError]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const val = emailRef.current?.value;
		if (!val) {
			toast.error("Email is required");
			return;
		}
		login(
			{ email: val },
			{
				onSuccess(data, _variables, _context) {
					if (data.success) {
						setUser(val);
						toast.success("Login successful");
					} else {
						toast.error(data.message);
					}
				},
				onError(error, _variables, _context) {
					toast.error(error.message);
				},
			},
		);
	};

	return (
		<>
			{user ? (
				children
			) : (
				<div className="flex flex-col items-center justify-center h-screen">
					<h1 className="text-2xl font-bold pb-4">Login</h1>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<p className="text-sm text-gray-500">
							Please enter your email to login.
						</p>
						<Input
							type="email"
							ref={emailRef}
							placeholder="Email"
							autoComplete="on"
							name="email"
						/>
						<Button type="submit" disabled={isLoginPending}>
							{isLoginPending ? <Spinner /> : "Login"}
						</Button>
					</form>
				</div>
			)}
		</>
	);
};
