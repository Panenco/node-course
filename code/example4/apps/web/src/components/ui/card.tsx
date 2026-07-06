import { cn } from "@/lib/utils";

export function Card({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"rounded-lg border border-slate-200 bg-white shadow-sm",
				className
			)}
			{...props}
		/>
	);
}
