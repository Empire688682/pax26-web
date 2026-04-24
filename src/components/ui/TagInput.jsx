"use client";

import { useState } from "react";

export function TagInput({ label, tags = [], onChange, placeholder, pax26, example }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const p = pax26;

  const addTag = () => {
    if (!input.trim()) return;
    const cleanTag = input.trim().toLowerCase();
    if (tags.includes(cleanTag)) {
      setInput("");
      return;
    }

    onChange([...tags, cleanTag]);
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

  const fieldStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    width: "100%",
    backgroundColor: p?.secondaryBg || "#f9f9f9",
    color: p?.textPrimary || "#000",
    border: `1px solid ${focused ? p?.primary : p?.border || "#ddd"}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? `0 0 0 3px ${p?.primary}18` : "none",
    minHeight: "45px",
    boxSizing: "border-box",
    cursor: "text",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: p?.textPrimary || "#000",
    opacity: 0.7,
    marginBottom: "6px",
  };

  const badgeStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: `${p?.primary}15` || "#eee",
    color: p?.primary || "#333",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "6px",
    border: `1px solid ${p?.primary}25`,
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      {label && <label style={labelStyle}>{label}</label>}
      
      <div 
        style={fieldStyle} 
        onClick={() => document.getElementById("tag-inner-input")?.focus()}
      >
        {tags.map((tag) => (
          <span key={tag} style={badgeStyle}>
            {tag}
            <button 
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, opacity: 0.6 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}

        <input
          id="tag-inner-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); addTag(); }}
          placeholder={tags.length === 0 ? placeholder || "Add tags..." : ""}
          style={{
            flex: 1,
            minWidth: "120px",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "14px",
            padding: "4px 0",
          }}
        />
      </div>
      {example && <p style={{ fontSize: "11px", color: p?.textPrimary, opacity: 0.4, margin: "6px 0 0" }}>{example}</p>}
    </div>
  );
}
