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
      {resolvedTheme === "dark" ? <SunIcon size={25} /> : <MoonIcon color="#131b2f" size={25} />}
    </button>
  );
};

export default ThemeToggle;
