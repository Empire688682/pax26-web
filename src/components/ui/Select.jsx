"use client";

import React from "react";
import { useGlobalContext } from "../Context";

export function Select({ label, options = [], value, onChange }) {
    const {pax26} = useGlobalContext();
  return (
    <div className="space-y-1"
         style={{color: pax26.textPrimary}}>
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{backgroundColor:pax26.card}}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
