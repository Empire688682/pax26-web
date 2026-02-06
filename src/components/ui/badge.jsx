// components/ui/badge.jsx

import React from 'react';

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-500 text-white",
    danger: "bg-red-500 text-white",
    warning: "bg-yellow-400 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
