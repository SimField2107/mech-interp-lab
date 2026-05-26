import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className = "", ...props }, ref) => {
    const base =
      "font-mono tracking-wider uppercase transition-all rounded-sm disabled:opacity-50";
    const variants = {
      primary: "bg-signal text-surface-0 hover:opacity-85",
      secondary:
        "bg-surface-2 text-fg-1 border border-rule-strong hover:border-fg-2 hover:text-fg-0",
    };
    const sizes = {
      sm: "text-[10px] px-2 py-1",
      md: "text-[11px] px-4 py-2",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
