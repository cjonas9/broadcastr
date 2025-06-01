/* 
ButtonWrapper.tsx: Component for the button wrapper
-------------------------------------------------
EXAMPLE USAGE:
<ButtonWrapper
  icon={<Star size={16} />}
  width="full"
  className="mb-4"
  >  
  Primary button with icon
</ButtonWrapper>
*/

import React, { forwardRef } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "disabled" | "tertiary";
type ButtonWidth = "full" | "hug";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  width?: ButtonWidth;
  corner?: "rounded-full" | "rounded-md";
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#654DC4] text-white hover:bg-[#7760D5]", 
  secondary: "bg-[#323238] text-white hover:bg-[#45454D]",
  tertiary: "text-white hover:text-[#AA99EC]",
  disabled: "bg-gray-800 text-gray-600 cursor-not-allowed", 
};

export const ButtonWrapper = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary",
  icon,
  width = "hug",
  corner = "rounded-full",
  children,
  className,
  disabled,
  ...props
}, ref) => {
  const isDisabled = variant === "disabled" || disabled;
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-medium transition-colors",
        variantClasses[variant],
        width === "full" ? "w-full" : "w-auto",
        corner === "rounded-full" ? "rounded-full" : "rounded-md",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
});