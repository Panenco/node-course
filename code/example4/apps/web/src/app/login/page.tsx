"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/api-hooks";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
	email: z.email("Enter a valid email"),
	password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof schema>;

function loginErrorMessage(error: unknown): string {
	// The SDK throws the API's error body ({ statusCode, message, ... }).
	// 401 means bad credentials; anything else is an unexpected server/network error.
	const statusCode = (error as { statusCode?: number } | null)?.statusCode;
	return statusCode === 401
		? "Invalid email or password."
		: "Something went wrong. Please try again.";
}

export default function LoginPage() {
	const router = useRouter();
	const loginMutation = useLogin();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({ resolver: zodResolver(schema) });

	const onSubmit = handleSubmit((values) => {
		loginMutation.mutate(values, {
			onSuccess: (data) => {
				setToken(data.token);
				router.replace("/users");
			},
		});
	});

	return (
		<main className="mx-auto flex min-h-screen max-w-md items-center px-4">
			<Card className="w-full p-8">
				<h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
				<p className="mb-6 text-sm text-slate-500">
					Use a seeded account, e.g. john@example.com / password123
				</p>
				<form onSubmit={onSubmit} className="space-y-4" noValidate>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" {...register("email")} />
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" {...register("password")} />
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">
								{errors.password.message}
							</p>
						)}
					</div>
					{loginMutation.isError && (
						<p className="text-sm text-red-600">
							{loginErrorMessage(loginMutation.error)}
						</p>
					)}
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Signing in…" : "Sign in"}
					</Button>
				</form>
			</Card>
		</main>
	);
}
