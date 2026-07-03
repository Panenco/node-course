"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserBody } from "@node-course/api-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type UserFormValues = z.infer<typeof schema>;

export function UserForm({
	initialValues,
	submitLabel,
	pending,
	onSubmit,
	onCancel,
}: {
	initialValues?: { name: string; email: string };
	submitLabel: string;
	pending: boolean;
	onSubmit: (body: UserBody) => void;
	onCancel: () => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialValues?.name ?? "",
			email: initialValues?.email ?? "",
			password: "",
		},
	});

	return (
		<form
			onSubmit={handleSubmit((values) => onSubmit(values))}
			className="space-y-4"
			noValidate
		>
			<div>
				<Label htmlFor="name">Name</Label>
				<Input id="name" {...register("name")} />
				{errors.name && (
					<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
				)}
			</div>
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
					<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
				)}
				<p className="mt-1 text-xs text-slate-400">
					The example API requires all fields (including password) on update.
				</p>
			</div>
			<div className="flex justify-end gap-2 pt-2">
				<Button type="button" variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : submitLabel}
				</Button>
			</div>
		</form>
	);
}
