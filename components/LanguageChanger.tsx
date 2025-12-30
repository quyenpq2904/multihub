"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";

const LanguageChanger = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          radius="full"
          className="min-w-fit w-10 px-0 sm:min-w-fit sm:w-auto sm:px-3"
        >
          <Icon icon="solar:global-linear" className="text-xl" />
          <span className="hidden sm:block font-medium uppercase">
            {locale}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Language selection"
        selectedKeys={new Set([locale])}
        selectionMode="single"
        onAction={(key) => handleLocaleChange(key as string)}
      >
        <DropdownItem key="en">English</DropdownItem>
        <DropdownItem key="vi">Tiếng Việt</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageChanger;
