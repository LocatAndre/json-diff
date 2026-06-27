import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages.js";

export function HeaderSettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-expanded={open}
        aria-controls="header-settings-menu"
        aria-label={m.header_menu_label()}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {open && (
        <div
          id="header-settings-menu"
          className="absolute top-full right-0 z-[60] mt-2 w-72 rounded-lg border border-border bg-popover p-4 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <LanguageSelector variant="menu" />
            <ThemeSelector variant="menu" />
          </div>
        </div>
      )}
    </div>
  );
}
