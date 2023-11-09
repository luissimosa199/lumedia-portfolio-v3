import { MouseEventHandler, useEffect, useState } from "react";

function useDarkMode(): [string | null, () => void] {
  // Initialization
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle function
  const toggleTheme: () => void = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both light and dark classes first
    root.classList.remove("light", "dark");
    if (!theme) {
      return;
    }
    // Add the current theme class
    root.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, toggleTheme];
}

export default useDarkMode;
