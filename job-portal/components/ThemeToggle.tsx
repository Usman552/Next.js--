'use client'
import React from "react";
import { useTheme } from "next-themes";
import {Moon , Sun} from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-md"
        >
        {theme === "dark"?<Moon size={20}/> : <Sun size={20} />  }
      </button>
    </div>
  );
};

export default ThemeToggle;
