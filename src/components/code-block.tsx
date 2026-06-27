import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <ScrollArea className={cn("rounded-lg bg-inset", className)}>
      <pre className="whitespace-pre p-3 font-mono text-xs leading-5">{children}</pre>
    </ScrollArea>
  );
}
