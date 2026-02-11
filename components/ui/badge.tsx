import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "secondary" | "blue" | "green" | "amber";

const variantClass: Record<BadgeVariant, string> = {
  secondary: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700"
};

type BadgeProps = HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}
