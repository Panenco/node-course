"use client";

import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createUser,
	deleteUser,
	listUsers,
	login,
	updateUser,
	type UserBody,
} from "@node-course/api-sdk";

const USERS_KEY = ["users"];

// Every hook calls a typed SDK function, checks the `{ data, error }` result,
// and lets TanStack Query handle loading/error/caching state.
export function useUsers(search: string) {
	return useQuery({
		queryKey: [...USERS_KEY, search],
		queryFn: async () => {
			const { data, error } = await listUsers({
				query: search ? { search } : undefined,
			});
			if (error) throw error;
			return data ?? [];
		},
	});
}

export function useLogin() {
	return useMutation({
		mutationFn: async (body: { email: string; password: string }) => {
			const { data, error } = await login({ body });
			if (error) throw error;
			return data!;
		},
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: UserBody) => {
			const { data, error } = await createUser({ body });
			if (error) throw error;
			return data!;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, body }: { id: string; body: UserBody }) => {
			const { data, error } = await updateUser({ path: { id }, body });
			if (error) throw error;
			return data!;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await deleteUser({ path: { id } });
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
	});
}
