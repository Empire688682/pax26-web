"use client";
import React from "react";
import { useGlobalContext } from "../Context";

export function Button({
  children,
  className = "",
  variant = "default",
  disabled = false,
  ...props
}) {
    const {pax26} = useGlobalContext()
  const baseStyles =
    "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200";

  const variants = {
    default:
      "bg-blue-600 hover:bg-blue-700 text-white",
    outline:
      "border border-white/10 hover:bg-white/5",
  };

  return (
    <button
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
