"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme(); // use resolvedTheme
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="px-4 z-50 mx-auto max-w-20 py-2 rounded dark:text-white"
    >
      {resolvedTheme === "dark" ? <img src="/sun-3335.png" alt="light-mode" /> : <img src="/moon-6677.png" alt="dark-mode" />}
    </button>
  );
};

export default ThemeToggle;
