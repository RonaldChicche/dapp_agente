import { HTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> { }

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "glass rounded-2xl p-6 sm:p-8 transition-all duration-300",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
