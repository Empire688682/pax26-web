"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function TagInput({ label, tags = [], onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (!input.trim()) return;
    if (tags.includes(input.trim())) return;

    onChange([...tags, input.trim()]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2 border rounded-md p-2 focus-within:ring-2 focus-within:ring-primary">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
          >
            {tag}
            <button onClick={() => removeTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type and press Enter"}
          className="flex-1 min-w-[120px] border-none outline-none text-sm"
        />
      </div>
      <span className="text-xs text-muted-foreground">Press Enter to add</span>
    </div>
  );
}
