import { cn } from "@/lib/utils";

export function Label({
	className,
	...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		<label
			className={cn("mb-1 block text-sm font-medium text-slate-700", className)}
			{...props}
		/>
	);
}
