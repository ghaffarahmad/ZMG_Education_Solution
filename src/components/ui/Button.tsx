import * as React from "react";
import { cn } from "@/lib/utils";

type SlottableChildProps = {
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-primary text-white hover:bg-primary/90 shadow-sm dark:text-white": variant === "primary",
        "bg-accent text-primary hover:bg-accent/90 shadow-sm dark:text-[#092128]": variant === "secondary",
        "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10": variant === "outline",
        "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10": variant === "ghost",
        "h-9 px-4 text-sm": size === "sm",
        "h-11 px-6 text-base": size === "md",
        "h-14 px-8 text-lg": size === "lg",
      },
      className
    );

    if (asChild && React.isValidElement<SlottableChildProps>(children)) {
      return React.cloneElement(children, {
        className: cn(classes, children.props.className),
        ...props
      } as Partial<SlottableChildProps>);
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
