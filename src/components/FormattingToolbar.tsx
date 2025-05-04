
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Link, Image, Quote } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FormattingToolbarProps {
  onFormat: (format: string) => void;
  className?: string;
}

export function FormattingToolbar({ onFormat, className }: FormattingToolbarProps) {
  return (
    <div className={`flex flex-wrap gap-1 p-1 ${className}`}>
      <ToggleGroup type="multiple" size="sm" variant="outline" className="flex flex-wrap justify-start">
        <ToggleGroupItem value="bold" aria-label="Mettre en gras" onClick={() => onFormat("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Mettre en italique" onClick={() => onFormat("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="Liste à puces" onClick={() => onFormat("bullet")}>
          <List className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="ordered-list" aria-label="Liste numérotée" onClick={() => onFormat("number")}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="heading1" aria-label="Titre niveau 1" onClick={() => onFormat("h1")}>
          <Heading1 className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="heading2" aria-label="Titre niveau 2" onClick={() => onFormat("h2")}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="code" aria-label="Code" onClick={() => onFormat("code")}>
          <Code className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="link" aria-label="Lien" onClick={() => onFormat("link")}>
          <Link className="h-3.5 w-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="quote" aria-label="Citation" onClick={() => onFormat("quote")}>
          <Quote className="h-3.5 w-3.5" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
