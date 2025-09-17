"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
        <p className="mt-4 text-gray-400 text-lg font-medium">Loading, please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
