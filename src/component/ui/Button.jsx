"use client";
import React from "react";
import { useGlobalContext } from "../Context";

export function Button({
  children,
  className = "",
  variant = "default",
  disabled = false,
  pageTo,
  ...props
}) {
  const { pax26, router} = useGlobalContext();

  const selectPage = (page) => {
      router.push(`/ai-automation/${page}`);
    };
  
  const baseStyles =
    "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200";

  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
    outline: "shadow-lg hover:shadow-xl hover:bg-white/5 transition-all",
  };

  // Compute dynamic styles
  const dynamicStyles = variant === "outline" 
    ? { 
        color: pax26.textPrimary,
        border: `1px solid ${pax26.textPrimary}40`,
        boxShadow: `0 4px 12px -2px ${pax26.header}30, 0 2px 4px -1px ${pax26.header}20`
      }
    : undefined;

  return (
    <button
      disabled={disabled}
      style={dynamicStyles}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      onClick={pageTo ? () => selectPage(pageTo) : undefined}
      {...props}
    >
      {children}
    </button>
  );
}