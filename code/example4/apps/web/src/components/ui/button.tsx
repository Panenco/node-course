import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
	primary: "bg-slate-900 text-white hover:bg-slate-700",
	secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
	danger: "bg-red-600 text-white hover:bg-red-500",
	ghost: "text-slate-600 hover:bg-slate-100",
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", ...props }, ref) => (
		<button
			ref={ref}
			className={cn(
				"inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
				variants[variant],
				className
			)}
			{...props}
		/>
	)
);
Button.displayName = "Button";
