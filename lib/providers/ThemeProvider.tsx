"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export default ThemeProvider;
