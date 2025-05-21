
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "system" : "light")}
      title="Toggle mode"
    >
      <span className="sr-only">Toggle mode</span>
      <span className="h-4 w-4 rotate-0 scale-100 transition-all">
        {theme === "light" ? "🔆" : "🌓"}
      </span>
    </Button>
  );
}
