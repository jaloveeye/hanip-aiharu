import React from "react";

type Variant = "h1" | "h2" | "h3" | "body" | "caption";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: React.ElementType;
}

const variantMap: Record<Variant, string> = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-semibold",
  h3: "text-xl font-medium",
  body: "text-base",
  caption: "text-xs text-gray-500",
};

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  as: Component = "span",
  className = "",
  ...props
}) => {
  return (
    <Component className={`${variantMap[variant]} ${className}`} {...props} />
  );
};
