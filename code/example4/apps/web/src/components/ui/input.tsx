import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
	<input
		ref={ref}
		className={cn(
			"flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50",
			className
		)}
		{...props}
	/>
));
Input.displayName = "Input";
