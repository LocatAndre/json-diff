import { AppLogo } from "@/components/AppLogo";
import { HeaderSettingsMenu } from "@/components/HeaderSettingsMenu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useMediaQuery } from "@/hooks/use-media-query";
import { m } from "@/paraglide/messages.js";

export function AppHeader() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:gap-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <AppLogo className="size-8 shrink-0 sm:size-9" />
          <span className="truncate font-semibold text-lg tracking-tight sm:text-xl md:text-2xl">
            {m.app_title()}
          </span>
        </div>

        {isMobile ? (
          <HeaderSettingsMenu />
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector variant="compact" />
            <ThemeSelector variant="compact" />
          </div>
        )}
      </div>
    </header>
  );
}
