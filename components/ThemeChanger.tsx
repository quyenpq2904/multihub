"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="bordered"
      radius="full"
      isIconOnly
    >
      {theme === "dark" ? (
        <Icon icon={"solar:sun-linear"} width={24} height={24} />
      ) : (
        <Icon icon={"solar:moon-linear"} width={24} height={24} />
      )}
    </Button>
  );
};

export default ThemeChanger;
