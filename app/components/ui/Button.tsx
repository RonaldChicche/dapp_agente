import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-mint-200 text-slate-800 hover:bg-mint-500": variant === "primary",
                        "bg-lavender-200 text-lavender-900 hover:bg-lavender-500 hover:text-white":
                            variant === "secondary",
                        "border border-lavender-200 bg-transparent hover:bg-lavender-100 text-lavender-900":
                            variant === "outline",
                        "hover:bg-lavender-100 text-lavender-900": variant === "ghost",
                        "h-9 px-4 py-2": size === "sm",
                        "h-11 px-8 py-2": size === "md",
                        "h-14 px-10 py-3 text-base": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
