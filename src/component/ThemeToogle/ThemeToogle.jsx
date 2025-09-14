"use client";
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, {useEffect, useState}from 'react';

const ThemeToogle = () => {
    const {theme, setTheme, systemTheme} = useTheme();
    const [mounted, setMounted] = useState(false);


     useEffect(()=>setMounted(true), []);
      if(!mounted) return null;

      const currentTheme = theme === "system" ? systemTheme : theme;
  return (
    <div
    onClick={()=>setTheme(currentTheme === "dark"? "light": "dark")}
    className='px-4 z-50 mx-auto max-w-20 fixed top-2 left-1/2 md:right-30 py-2 rounded dark:text-white'
    >
     {currentTheme === "dark"? <SunIcon size={30}/> : <MoonIcon size={30}/> }
    </div>
  )
}

export default ThemeToogle
