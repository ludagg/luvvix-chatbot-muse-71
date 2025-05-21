
import React from 'react';
import { Button } from "@/components/ui/button";

// This is a simplified version that doesn't depend on the theme provider
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  
  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Save to localStorage so it persists
    localStorage.setItem('luvvix-ai-theme', newTheme);
    
    // Apply the theme to the document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize from localStorage on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('luvvix-ai-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title="Toggle theme"
      className="text-foreground"
    >
      <span className="sr-only">Toggle theme</span>
      <span className="h-4 w-4 rotate-0 scale-100 transition-all">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
    </Button>
  );
}
