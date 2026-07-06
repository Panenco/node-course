"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserView } from "@node-course/api-sdk";
import {
	useCreateUser,
	useDeleteUser,
	useUpdateUser,
	useUsers,
} from "@/lib/api-hooks";
import { clearToken, isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserForm } from "@/components/user-form";

type Editing = { mode: "create" } | { mode: "edit"; user: UserView } | null;

export default function UsersPage() {
	const router = useRouter();
	const [authChecked, setAuthChecked] = useState(false);
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<Editing>(null);

	useEffect(() => {
		if (!isAuthenticated()) {
			router.replace("/login");
		} else {
			setAuthChecked(true);
		}
	}, [router]);

	const usersQuery = useUsers(search);
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const deleteUser = useDeleteUser();

	if (!authChecked) return null;

	const logout = () => {
		clearToken();
		router.replace("/login");
	};

	return (
		<main className="mx-auto max-w-3xl px-4 py-10">
			<header className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Users</h1>
				<div className="flex gap-2">
					<Button onClick={() => setEditing({ mode: "create" })}>
						New user
					</Button>
					<Button variant="ghost" onClick={logout}>
						Log out
					</Button>
				</div>
			</header>

			<Input
				placeholder="Search by name or email…"
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				className="mb-4"
			/>

			<Card className="divide-y divide-slate-100">
				{usersQuery.isLoading && (
					<p className="p-4 text-sm text-slate-500">Loading…</p>
				)}
				{usersQuery.isError && (
					<p className="p-4 text-sm text-red-600">Failed to load users.</p>
				)}
				{usersQuery.data?.length === 0 && (
					<p className="p-4 text-sm text-slate-500">No users found.</p>
				)}
				{usersQuery.data?.map((user) => (
					<div
						key={user.id}
						className="flex items-center justify-between p-4"
					>
						<div>
							<p className="font-medium">{user.name}</p>
							<p className="text-sm text-slate-500">{user.email}</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="secondary"
								onClick={() => setEditing({ mode: "edit", user })}
							>
								Edit
							</Button>
							<Button
								variant="danger"
								disabled={deleteUser.isPending}
								onClick={() => {
									if (confirm(`Delete ${user.name}?`)) {
										deleteUser.mutate(user.id);
									}
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				))}
			</Card>

			{editing && (
				<div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4">
					<Card className="w-full max-w-md p-6">
						<h2 className="mb-4 text-lg font-semibold">
							{editing.mode === "create" ? "New user" : "Edit user"}
						</h2>
						<UserForm
							initialValues={
								editing.mode === "edit"
									? { name: editing.user.name, email: editing.user.email }
									: undefined
							}
							submitLabel={editing.mode === "create" ? "Create" : "Save"}
							pending={createUser.isPending || updateUser.isPending}
							onCancel={() => setEditing(null)}
							onSubmit={(body) => {
								if (editing.mode === "create") {
									createUser.mutate(body, { onSuccess: () => setEditing(null) });
								} else {
									updateUser.mutate(
										{ id: editing.user.id, body },
										{ onSuccess: () => setEditing(null) }
									);
								}
							}}
						/>
					</Card>
				</div>
			)}
		</main>
	);
}
