"use client";

// components/ui/card.jsx

import React from 'react';
import { useGlobalContext } from '../Context';

export function Card({ children, className }) {
  const {pax26} = useGlobalContext();
  return (
    <div className={`rounded-2xl shadow-md p-4 ${className}`}
    style={{backgroundColor:pax26.secondaryBg}}>{children}</div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>{children}</div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={`mt-2 ${className}`}>{children}</div>
  );
}