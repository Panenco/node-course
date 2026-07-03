"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { configureApiClient } from "@node-course/api-sdk";
import { getToken } from "@/lib/auth";

configureApiClient({
	baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
	getToken,
});

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
