import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: "Node Course — User Admin",
	description: "Example product frontend for the Panenco Node course",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
