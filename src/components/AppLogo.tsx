import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-9 shrink-0 text-foreground", className)}
    >
      <path
        d="M8 5.5C6.2 5.5 5 7.4 5 12c0 4.6 1.2 6.5 3 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-70"
      />
      <path
        d="M16 5.5c1.8 0 3 1.9 3 6.5 0 4.6-1.2 6.5-3 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-70"
      />
      <path
        d="M10 11h3.5"
        className="stroke-removed"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 15h5"
        className="stroke-added"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
