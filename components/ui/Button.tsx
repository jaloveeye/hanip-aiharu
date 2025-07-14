import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const baseStyles =
  "rounded px-3 py-1 font-medium transition-colors focus:outline-none focus:ring-0";
const variants = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
};
const sizes = {
  sm: "text-sm py-1 px-2",
  md: "text-base py-2 px-4",
  lg: "text-lg py-3 px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
